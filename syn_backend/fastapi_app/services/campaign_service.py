import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path

from fastapi_app.models.campaign_new import Campaign, CreateCampaignRequest, CampaignStatus
from fastapi_app.services.matrix_scheduler import get_matrix_scheduler
from fastapi_app.api.v1.accounts.services import account_service
from fastapi_app.core.logger import logger

CAMPAIGNS_FILE = Path("data/campaigns.json")

class CampaignService:
    def __init__(self):
        self.campaigns: Dict[str, Campaign] = {}
        self._load_campaigns()
        self.scheduler = get_matrix_scheduler()

    def _load_campaigns(self):
        if CAMPAIGNS_FILE.exists():
            try:
                with open(CAMPAIGNS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        campaign = Campaign(**item)
                        self.campaigns[campaign.id] = campaign
            except Exception as e:
                logger.error(f"Failed to load campaigns: {e}")

    def _save_campaigns(self):
        CAMPAIGNS_FILE.parent.mkdir(parents=True, exist_ok=True)
        try:
            data = [c.model_dump(mode="json") for c in self.campaigns.values()]
            with open(CAMPAIGNS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save campaigns: {e}")

    async def create_campaign(self, request: CreateCampaignRequest) -> Campaign:
        # 1. 获取账号信息并按平台分组
        all_accounts_resp = await account_service.list_accounts(limit=10000)
        all_accounts = all_accounts_resp.get("items", [])
        
        accounts_map = {}
        for acc_id in request.account_ids:
            # 查找账号对应的平台
            # 注意：all_accounts 是 flat list，包含 account_id, platform 等
            account = next((a for a in all_accounts if a.get('account_id') == acc_id or a.get('id') == acc_id), None)
            if account:
                platform = account.get('platform')
                if platform:
                    if platform not in accounts_map:
                        accounts_map[platform] = []
                    # MatrixScheduler 需要 account_id
                    accounts_map[platform].append(acc_id)
        
        # 2. 生成任务（传递间隔模式和时长）
        tasks = self.scheduler.generate_tasks(
            platforms=request.platforms,
            accounts=accounts_map,
            materials=request.material_ids,
            title=request.name, 
            description=request.remark,
            batch_name=request.name,
            interval_enabled=request.interval_enabled,
            interval_mode=request.interval_mode.value,
            interval_minutes=request.interval_minutes,
            schedule_type=request.schedule_type.value,
            start_time=request.start_time,
            end_time=request.end_time
        )
        
        # 3. 创建 Campaign 对象
        campaign = Campaign(
            name=request.name,
            platforms=request.platforms,
            account_ids=request.account_ids,
            material_ids=request.material_ids,
            schedule_type=request.schedule_type,
            start_time=request.start_time,
            end_time=request.end_time,
            interval_enabled=request.interval_enabled,
            interval_mode=request.interval_mode,
            interval_minutes=request.interval_minutes,
            goals=request.goals,
            remark=request.remark,
            task_count=len(tasks),
            status=CampaignStatus.RUNNING, # 默认直接开始
            task_ids=[t.task_id for t in tasks]
        )
        
        # 4. 更新任务的 batch_id 为 campaign_id
        for task in tasks:
            task.batch_id = campaign.id
        
        self.campaigns[campaign.id] = campaign
        self._save_campaigns()
        
        return campaign

    def get_campaign(self, campaign_id: str) -> Optional[Campaign]:
        return self.campaigns.get(campaign_id)

    def list_campaigns(self) -> List[Campaign]:
        # 按创建时间倒序
        return sorted(self.campaigns.values(), key=lambda c: c.created_at, reverse=True)

    def delete_campaign(self, campaign_id: str):
        if campaign_id in self.campaigns:
            del self.campaigns[campaign_id]
            self._save_campaigns()
            # TODO: 取消关联的任务 (调用 scheduler.cancel_task)

    def pause_campaign(self, campaign_id: str):
        campaign = self.campaigns.get(campaign_id)
        if campaign:
            campaign.status = CampaignStatus.PAUSED
            self._save_campaigns()
            # TODO: 通知 Scheduler 暂停任务

    def resume_campaign(self, campaign_id: str):
        campaign = self.campaigns.get(campaign_id)
        if campaign:
            campaign.status = CampaignStatus.RUNNING
            self._save_campaigns()
            # TODO: 通知 Scheduler 恢复任务
            
    def get_campaign_tasks(self, campaign_id: str):
        """获取计划关联的任务详情"""
        campaign = self.campaigns.get(campaign_id)
        if not campaign:
            return []
            
        # 从 Scheduler 获取任务详情
        tasks = []
        for task_id in campaign.task_ids:
            task = self.scheduler.get_task_by_id(task_id)
            if task:
                tasks.append(task)
        return tasks

# Global instance
_campaign_service = None

def get_campaign_service():
    global _campaign_service
    if _campaign_service is None:
        _campaign_service = CampaignService()
    return _campaign_service
