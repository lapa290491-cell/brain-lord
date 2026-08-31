from fastapi import FastAPI
from pydantic import BaseModel
from orchestrator import CPO_Orchestrator

app = FastAPI(title="EGREGOR CYBER-CENTER API")
orchestrator = CPO_Orchestrator()

class CampaignRequest(BaseModel):
    name: str
    objective: str

@app.post("/api/v1/campaign/execute")
async def execute_campaign(req: CampaignRequest):
    """Принимает команду 'ВНЕДРИТЬ' с дашборда"""
    camp_id, tasks = orchestrator.initiate_campaign(req.name, req.objective)
    return {
        "status": "SUCCESS",
        "campaign_id": camp_id,
        "message": "Сигнал передан кланам. Формируется матрица задач.",
        "distribution": tasks,
        "approval": "pending_approval",
        "published": False
    }

@app.get("/api/v1/system/status")
async def get_status():
    """Отдает статус агентов для подсветки 3D-узлов на планшете"""
    return {
        "system": "ONLINE",
        "active_agents": 104,
        "threat_level": "LOW",
        "campaigns": len(orchestrator.active_campaigns)
    }
