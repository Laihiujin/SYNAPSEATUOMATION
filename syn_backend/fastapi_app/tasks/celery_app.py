from __future__ import annotations

import os
from celery import Celery

from fastapi_app.core.config import resolved_celery_broker_url, resolved_celery_result_backend

# Fix for Celery 5.5.x Windows thread-local storage bug
os.environ.setdefault('FORKED_BY_MULTIPROCESSING', '1')

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
    # Ensure non-default task modules are loaded by the worker.
    include=["fastapi_app.tasks.publish_tasks"],
    # Worker pool configuration for Windows
    worker_pool="solo",  # Use solo pool to avoid Windows multiprocessing issues
    worker_pool_restarts=True,
    worker_prefetch_multiplier=1,  # Disable prefetching for solo pool
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks to prevent memory leaks
)
