import asyncio
import json
import os
from pathlib import Path
from typing import Dict, List, Set

from loguru import logger

from myUtils.cookie_manager import cookie_manager

BASE_DIR = Path(__file__).resolve().parents[1]


def _profiles_dir() -> Path:
    return BASE_DIR / "browser_profiles"


def _fingerprints_dir() -> Path:
    return BASE_DIR / "fingerprints"


def _storage_state_dir() -> Path:
    return cookie_manager.cookies_dir / "storage_state"


def _allowed_accounts() -> List[Dict[str, str]]:
    accounts = cookie_manager.list_flat_accounts()
    normalized = []
    for acc in accounts:
        platform = acc.get("platform")
        account_id = acc.get("account_id")
        if platform and account_id:
            normalized.append({"platform": str(platform), "account_id": str(account_id)})
    return normalized


def _allowed_profile_names() -> Set[str]:
    return {f"{a['platform']}_{a['account_id']}" for a in _allowed_accounts()}


def cleanup_profiles() -> Dict[str, int]:
    profiles_dir = _profiles_dir()
    profiles_dir.mkdir(parents=True, exist_ok=True)
    allowed = _allowed_profile_names()
    removed = 0
    kept = 0

    for item in profiles_dir.iterdir():
        if not item.is_dir():
            continue
        if item.name in allowed:
            kept += 1
            continue
        try:
            import shutil

            shutil.rmtree(item)
            removed += 1
        except Exception as exc:
            logger.warning(f"[ProfileManager] Failed to remove profile {item}: {exc}")

    return {"kept": kept, "removed": removed}


def ensure_profiles_for_accounts() -> Dict[str, int]:
    profiles_dir = _profiles_dir()
    profiles_dir.mkdir(parents=True, exist_ok=True)
    accounts = _allowed_accounts()
    created = 0
    existing = 0
    for acc in accounts:
        name = f"{acc['platform']}_{acc['account_id']}"
        target = profiles_dir / name
        if target.exists():
            existing += 1
            continue
        try:
            target.mkdir(parents=True, exist_ok=True)
            created += 1
        except Exception as exc:
            logger.warning(f"[ProfileManager] Failed to create profile {target}: {exc}")
    return {"created": created, "existing": existing}


def cleanup_fingerprints() -> Dict[str, int]:
    fingerprints_dir = _fingerprints_dir()
    fingerprints_dir.mkdir(parents=True, exist_ok=True)
    allowed_accounts = _allowed_accounts()
    allowed = {f"account_{a['account_id']}_{a['platform']}.json" for a in allowed_accounts}
    removed = 0
    kept = 0

    for item in fingerprints_dir.iterdir():
        if not item.is_file():
            continue
        if item.name in allowed:
            kept += 1
            continue
        try:
            item.unlink()
            removed += 1
        except Exception as exc:
            logger.warning(f"[ProfileManager] Failed to remove fingerprint {item}: {exc}")

    return {"kept": kept, "removed": removed}


def _resolve_chrome_path() -> str:
    local_path = os.getenv("LOCAL_CHROME_PATH")
    if local_path:
        candidate = Path(local_path)
        if not candidate.is_absolute():
            candidate = (BASE_DIR.parent / candidate).resolve()
        if candidate.exists():
            return str(candidate)
    fallback = BASE_DIR.parent / "browsers" / "chromium" / "chromium-1161" / "chrome-win" / "chrome.exe"
    if fallback.exists():
        return str(fallback)
    return ""


async def _export_state_for_account(profile_dir: Path, platform: str, account_id: str) -> bool:
    chrome_path = _resolve_chrome_path()
    if not chrome_path:
        logger.warning("[ProfileManager] Chrome path not found, skip export")
        return False

    try:
        from playwright.async_api import async_playwright
    except Exception as exc:
        logger.warning(f"[ProfileManager] Playwright missing: {exc}")
        return False

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            str(profile_dir),
            headless=True,
            executable_path=chrome_path,
            args=["--disable-blink-features=AutomationControlled"],
        )
        await context.new_page()
        state = await context.storage_state()
        await context.close()

    output_dir = _storage_state_dir()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{platform}_{account_id}.json"
    output_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return True


def export_profile_storage_states() -> Dict[str, int]:
    profiles_dir = _profiles_dir()
    profiles_dir.mkdir(parents=True, exist_ok=True)
    allowed = _allowed_accounts()
    exported = 0
    failed = 0

    for acc in allowed:
        profile_name = f"{acc['platform']}_{acc['account_id']}"
        profile_dir = profiles_dir / profile_name
        if not profile_dir.exists():
            failed += 1
            continue
        try:
            if asyncio.run(_export_state_for_account(profile_dir, acc["platform"], acc["account_id"])):
                exported += 1
            else:
                failed += 1
        except Exception as exc:
            logger.warning(f"[ProfileManager] Export failed for {profile_name}: {exc}")
            failed += 1

    return {"exported": exported, "failed": failed}
