import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx
from loguru import logger


DEFAULT_UA = os.getenv(
    "FAST_COOKIE_UA",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
)


PLATFORM_NAMES: Dict[int, str] = {
    1: "xiaohongshu",
    2: "channels",
    3: "douyin",
    4: "kuaishou",
    5: "bilibili",
}
PLATFORM_CODES: Dict[str, int] = {v: k for k, v in PLATFORM_NAMES.items()}
PLATFORM_ALIASES: Dict[str, str] = {
    "tencent": "channels",
    "wechat": "channels",
    "weixin": "channels",
}


FAST_CHECKS: Dict[str, Dict[str, Any]] = {
    "xiaohongshu": {
        "method": "GET",
        "url": "https://edith.xiaohongshu.com/api/sns/web/v1/user/selfinfo",
        "domain_filter": "xiaohongshu.com",
        "headers": {
            "Referer": "https://creator.xiaohongshu.com/",
            "Origin": "https://creator.xiaohongshu.com",
        },
        "ok_key": lambda r: r.get("code") == 0,
        "extract": lambda r: (
            str((r.get("data") or {}).get("userId") or (r.get("data") or {}).get("user_id") or ""),
            (r.get("data") or {}).get("nickname") or (r.get("data") or {}).get("name") or "",
            (r.get("data") or {}).get("image") or (r.get("data") or {}).get("avatar") or "",
        ),
    },
    "channels": {
        "method": "GET",
        "url": "https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_data",
        "domain_filter": "channels.weixin.qq.com",
        "headers": {
            "Referer": "https://channels.weixin.qq.com/",
            "Origin": "https://channels.weixin.qq.com",
        },
        "ok_key": lambda r: r.get("ret") == 0,
        "extract": lambda r: (
            str(
                (((r.get("data") or {}).get("finderUser") or {}).get("username"))
                or (((r.get("data") or {}).get("finderUser") or {}).get("finderUsername"))
                or ""
            ),
            (((r.get("data") or {}).get("finderUser") or {}).get("nickname")) or "",
            (((r.get("data") or {}).get("finderUser") or {}).get("headImgUrl")) or "",
        ),
    },
    "douyin": {
        "method": "GET",
        "url": "https://www.douyin.com/aweme/v1/web/user/info/",
        "domain_filter": "douyin.com",
        "headers": {
            "Referer": "https://www.douyin.com/",
            "Origin": "https://www.douyin.com",
        },
        "ok_key": lambda r: r.get("status_code") == 0,
        "extract": lambda r: (
            str(((r.get("user_info") or {}).get("uid")) or ""),
            ((r.get("user_info") or {}).get("nickname")) or "",
            ((r.get("user_info") or {}).get("avatar_url")) or "",
        ),
    },
    "kuaishou": {
        "method": "POST",
        "url": "https://www.kuaishou.com/graphql",
        "domain_filter": "kuaishou.com",
        "headers": {
            "Referer": "https://www.kuaishou.com/",
            "Origin": "https://www.kuaishou.com",
        },
        "json": {
            "operationName": "visionProfile",
            "variables": {},
            "query": "query visionProfile {visionProfile {userProfile {__typename}}}",
        },
        "ok_key": lambda r: bool(((r.get("data") or {}).get("visionProfile") or {}).get("userProfile") is not None),
        "extract": lambda r: ("", "", ""),
    },
    "bilibili": {
        "method": "GET",
        "url": "https://api.bilibili.com/x/web-interface/nav",
        "domain_filter": "bilibili.com",
        "headers": {
            "Referer": "https://www.bilibili.com/",
            "Origin": "https://www.bilibili.com",
        },
        "ok_key": lambda r: r.get("code") == 0 and (r.get("data") or {}).get("isLogin") is True,
        "extract": lambda r: (
            str((r.get("data") or {}).get("mid") or ""),
            (r.get("data") or {}).get("uname") or "",
            (r.get("data") or {}).get("face") or "",
        ),
    },
}


def _normalize_platform(platform: Any) -> str:
    if isinstance(platform, int):
        return PLATFORM_NAMES.get(platform, "")
    name = str(platform or "").strip().lower()
    if name in PLATFORM_ALIASES:
        name = PLATFORM_ALIASES[name]
    return name


def _load_json_file(path: str) -> Optional[Any]:
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except Exception:
        return None


def _resolve_cookie_path(account_file: str) -> str:
    if not account_file:
        return account_file
    try:
        p = Path(account_file)
        if p.exists():
            return str(p)
    except Exception:
        pass
    try:
        from platforms.path_utils import resolve_cookie_file

        candidate = resolve_cookie_file(account_file)
        if candidate and Path(candidate).exists():
            return candidate
        return candidate
    except Exception:
        return account_file


def _extract_cookies(data: Any) -> List[Dict[str, Any]]:
    cookies: List[Dict[str, Any]] = []
    if isinstance(data, dict):
        cookie_info = data.get("cookie_info")
        if isinstance(cookie_info, dict) and isinstance(cookie_info.get("cookies"), list):
            cookies.extend(cookie_info.get("cookies", []))
        if isinstance(data.get("cookies"), list):
            cookies.extend(data.get("cookies", []))
        if isinstance(data.get("origins"), list):
            for origin in data.get("origins", []):
                if isinstance(origin, dict) and isinstance(origin.get("cookies"), list):
                    cookies.extend(origin.get("cookies", []))
        if isinstance(data.get("cookie"), list):
            cookies.extend(data.get("cookie", []))
    elif isinstance(data, list):
        cookies.extend(data)
    return cookies


def _cookie_header(cookies: List[Dict[str, Any]], domain_filter: Optional[str] = None) -> str:
    pairs: List[str] = []
    for item in cookies:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        value = item.get("value")
        if not name or value is None:
            continue
        domain = item.get("domain") or ""
        if domain_filter and domain and domain_filter not in str(domain):
            continue
        pairs.append(f"{name}={value}")
    return "; ".join(pairs)


def _cookie_header_from_data(data: Any, domain_filter: Optional[str] = None) -> str:
    if isinstance(data, str):
        return data.strip()
    if isinstance(data, dict):
        for key in ("raw", "cookie", "cookie_str", "cookieString"):
            val = data.get(key)
            if isinstance(val, str) and val.strip():
                return val.strip()
    cookies = _extract_cookies(data)
    return _cookie_header(cookies, domain_filter=domain_filter)


def _fallback_user_id(platform: str, cookie_data: Any) -> str:
    cookies = _extract_cookies(cookie_data)
    id_fields = {
        "kuaishou": ["userId", "bUserId", "kuaishou.user.id"],
        "channels": ["wxuin", "uin"],
        "bilibili": ["DedeUserID"],
    }
    for field in id_fields.get(platform, []):
        for item in cookies:
            if isinstance(item, dict) and item.get("name") == field and item.get("value"):
                return str(item.get("value"))

    # LocalStorage fallbacks
    if isinstance(cookie_data, dict) and isinstance(cookie_data.get("origins"), list):
        for origin in cookie_data.get("origins", []):
            local_items = (origin or {}).get("localStorage") or []
            for entry in local_items:
                if not isinstance(entry, dict):
                    continue
                if platform == "channels" and entry.get("name") == "finder_username" and entry.get("value"):
                    return str(entry.get("value"))
                if platform == "xiaohongshu" and entry.get("name") in {"USER_INFO_FOR_BIZ", "USER_INFO"}:
                    try:
                        payload = json.loads(entry.get("value") or "{}")
                        uid = payload.get("userId") or (payload.get("user") or {}).get("value", {}).get("userId")
                        if uid:
                            return str(uid)
                    except Exception:
                        continue
    return ""


class FastCookieValidator:
    def __init__(self) -> None:
        self._ua = DEFAULT_UA

    async def validate_cookie_fast(
        self,
        platform: Any,
        account_file: Optional[str] = None,
        cookie_data: Any = None,
        *,
        timeout: float = 3.0,
        include_raw: bool = False,
    ) -> Dict[str, Any]:
        platform_name = _normalize_platform(platform)
        if not platform_name or platform_name not in FAST_CHECKS:
            return {"status": "error", "error": f"Unsupported platform: {platform}"}

        conf = FAST_CHECKS[platform_name]
        domain_filter = conf.get("domain_filter")

        if cookie_data is None and account_file:
            path = _resolve_cookie_path(account_file)
            cookie_data = _load_json_file(path)
            if cookie_data is None:
                return {"status": "error", "error": f"Cookie file not found or invalid: {account_file}"}

        cookie_header = _cookie_header_from_data(cookie_data, domain_filter=domain_filter)
        if not cookie_header:
            return {"status": "error", "error": "Cookie header is empty"}

        headers = {
            "User-Agent": self._ua,
            "Accept": "application/json, text/plain, */*",
            "Cookie": cookie_header,
        }
        headers.update(conf.get("headers") or {})

        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
                if conf.get("method") == "POST":
                    resp = await client.post(conf["url"], json=conf.get("json"))
                else:
                    resp = await client.get(conf["url"])
        except httpx.HTTPError as exc:
            return {"status": "network_error", "error": str(exc)}

        elapsed_ms = int((time.monotonic() - start) * 1000)
        text_preview = ""
        try:
            text_preview = (resp.text or "").strip()[:200]
        except Exception:
            text_preview = ""

        if resp.status_code >= 400:
            if platform_name == "xiaohongshu" and resp.status_code == 406:
                return {
                    "status": "error",
                    "error": "XHS requires signed headers (x-s/x-t).",
                    "http_status": resp.status_code,
                    "elapsed_ms": elapsed_ms,
                }
            if platform_name == "douyin" and "Janus" in text_preview:
                return {
                    "status": "error",
                    "error": "Douyin blocked (Janus); requires signed params (X-Bogus).",
                    "http_status": resp.status_code,
                    "elapsed_ms": elapsed_ms,
                }
            return {
                "status": "error",
                "error": f"HTTP {resp.status_code}",
                "http_status": resp.status_code,
                "elapsed_ms": elapsed_ms,
            }

        if text_preview.startswith("<!DOCTYPE") or text_preview.startswith("<html"):
            return {
                "status": "expired",
                "ok": False,
                "platform": platform_name,
                "user_id": None,
                "name": None,
                "avatar": None,
                "elapsed_ms": elapsed_ms,
                "http_status": resp.status_code,
                "note": "HTML response (likely not logged in)",
            }
        try:
            data = resp.json()
        except Exception:
            return {
                "status": "error",
                "error": f"Invalid JSON response: {resp.status_code}",
                "http_status": resp.status_code,
            }

        ok = False
        try:
            ok = bool(conf["ok_key"](data))
        except Exception:
            ok = False

        user_id = ""
        name = ""
        avatar = ""
        try:
            extract_fn = conf.get("extract")
            if extract_fn:
                user_id, name, avatar = extract_fn(data)
        except Exception:
            user_id = ""
            name = ""
            avatar = ""
        if not user_id:
            user_id = _fallback_user_id(platform_name, cookie_data)

        payload: Dict[str, Any] = {
            "status": "valid" if ok else "expired",
            "ok": ok,
            "platform": platform_name,
            "user_id": user_id or None,
            "name": name or None,
            "avatar": avatar or None,
            "elapsed_ms": elapsed_ms,
            "http_status": resp.status_code,
        }
        if include_raw:
            payload["data"] = data
        return payload


__all__ = ["FastCookieValidator", "PLATFORM_NAMES", "PLATFORM_CODES"]
