from __future__ import annotations

from fastapi_app.tasks.celery_app import celery_app


@celery_app.task(name="publish.batch_stub")
def publish_batch_stub(batch_id: str) -> dict:
    # Placeholder: integrate with existing TaskQueueManager in myUtils later.
    return {"batch_id": batch_id, "status": "queued"}

