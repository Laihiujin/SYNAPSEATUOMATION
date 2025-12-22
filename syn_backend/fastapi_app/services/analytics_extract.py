from __future__ import annotations

from datetime import datetime
from typing import Any, Dict


def extract_video_info(platform: str, raw: Dict[str, Any], work_id: str) -> Dict[str, Any]:
    """
    Best-effort extraction of video info from social-media-copilot response.
    Normalizes to the analytics_db video_analytics schema fields.
    """
    platform = (platform or "").lower()
    base_date = datetime.utcnow().date().isoformat()

    def to_date(ts: Any) -> str:
        try:
            ts_int = int(ts)
            if ts_int > 1e12:
                ts_int = ts_int / 1000
            return datetime.utcfromtimestamp(ts_int).date().isoformat()
        except Exception:
            return base_date

    if platform == "douyin":
        detail = raw.get("aweme_detail") or raw.get("data") or raw
        stats = detail.get("statistics", {}) if isinstance(detail, dict) else {}
        video_info = detail.get("video", {}) if isinstance(detail, dict) else {}
        cover = None
        try:
            cover = video_info.get("cover", {}).get("url_list", [None])[0]
        except Exception:
            cover = None
        return {
            "platform": "douyin",
            "video_id": (detail.get("aweme_id") if isinstance(detail, dict) else None) or work_id,
            "video_url": (
                detail.get("share_url")
                or detail.get("video_share_url")
                or (detail.get("share_info", {}) if isinstance(detail, dict) else {}).get("share_url")
            ),
            "title": (detail.get("desc") if isinstance(detail, dict) else None) or (detail.get("title") if isinstance(detail, dict) else None) or "",
            "thumbnail": cover,
            "publish_date": to_date((detail.get("create_time") if isinstance(detail, dict) else None) or (detail.get("publish_time") if isinstance(detail, dict) else None) or datetime.utcnow().timestamp()),
            "play_count": (stats.get("play_count") or stats.get("play_count_v2") or 0) if isinstance(stats, dict) else 0,
            "like_count": (stats.get("digg_count") or 0) if isinstance(stats, dict) else 0,
            "comment_count": (stats.get("comment_count") or 0) if isinstance(stats, dict) else 0,
            "collect_count": (stats.get("collect_count") or 0) if isinstance(stats, dict) else 0,
            "share_count": (stats.get("share_count") or 0) if isinstance(stats, dict) else 0,
            "raw_data": raw,
        }

    if platform == "xiaohongshu":
        note = raw.get("note") or raw.get("data") or raw
        stats = note.get("interact_info", {}) if isinstance(note, dict) else {}
        images = note.get("images_list") or note.get("image_list") or []
        cover = None
        if isinstance(images, list) and images:
            first = images[0] or {}
            if isinstance(first, dict):
                cover = first.get("url") or first.get("image_url")
        publish_time = (note.get("time") if isinstance(note, dict) else None) or (note.get("create_time") if isinstance(note, dict) else None) or datetime.utcnow().timestamp()
        return {
            "platform": "xiaohongshu",
            "video_id": (note.get("note_id") if isinstance(note, dict) else None) or work_id,
            "video_url": f"https://www.xiaohongshu.com/explore/{(note.get('note_id') if isinstance(note, dict) else None) or work_id}",
            "title": (note.get("title") if isinstance(note, dict) else None) or (note.get("desc") if isinstance(note, dict) else None) or "",
            "thumbnail": cover,
            "publish_date": to_date(publish_time),
            "play_count": (stats.get("played_count") or stats.get("expose_count") or 0) if isinstance(stats, dict) else 0,
            "like_count": (stats.get("liked_count") or 0) if isinstance(stats, dict) else 0,
            "comment_count": (stats.get("comment_count") or 0) if isinstance(stats, dict) else 0,
            "collect_count": (stats.get("collected_count") or 0) if isinstance(stats, dict) else 0,
            "share_count": (stats.get("shared_count") or 0) if isinstance(stats, dict) else 0,
            "raw_data": raw,
        }

    if platform == "kuaishou":
        detail = raw.get("visionVideoDetail") or raw.get("data") or raw
        photo = detail.get("photo", {}) if isinstance(detail, dict) else {}
        stats = photo
        return {
            "platform": "kuaishou",
            "video_id": (photo.get("id") if isinstance(photo, dict) else None) or work_id,
            "video_url": f"https://www.kuaishou.com/short-video/{(photo.get('id') if isinstance(photo, dict) else None) or work_id}",
            "title": (photo.get("caption") if isinstance(photo, dict) else None) or (photo.get("title") if isinstance(photo, dict) else None) or "",
            "thumbnail": (photo.get("coverUrl") if isinstance(photo, dict) else None),
            "publish_date": to_date((photo.get("timestamp") if isinstance(photo, dict) else None) or datetime.utcnow().timestamp()),
            "play_count": (stats.get("viewCount") or 0) if isinstance(stats, dict) else 0,
            "like_count": (stats.get("likeCount") or stats.get("realLikeCount") or 0) if isinstance(stats, dict) else 0,
            "comment_count": (((photo.get("commentLimit") or {}) if isinstance(photo, dict) else {}).get("count") or (stats.get("commentCount") if isinstance(stats, dict) else 0) or 0),
            "collect_count": (stats.get("collectCount") or 0) if isinstance(stats, dict) else 0,
            "share_count": (stats.get("shareCount") or 0) if isinstance(stats, dict) else 0,
            "raw_data": raw,
        }

    return {
        "platform": platform or "unknown",
        "video_id": work_id,
        "video_url": None,
        "title": "",
        "thumbnail": None,
        "publish_date": base_date,
        "play_count": 0,
        "like_count": 0,
        "comment_count": 0,
        "collect_count": 0,
        "share_count": 0,
        "raw_data": raw,
    }

