from __future__ import annotations

from celery import Celery

from fastapi_app.core.config import resolved_celery_broker_url, resolved_celery_result_backend


celery_app = Celery(
    "synapse",
    broker=resolved_celery_broker_url(),
    backend=resolved_celery_result_backend(),
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=False,
)

