"""BRAIN-LORD 2.0 — FastAPI entrypoint.

Skeleton only. No LLM calls yet. Human-in-the-Loop:
nothing is published from these endpoints.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

from orchestrator import Orchestrator

app = FastAPI(
    title="BRAIN-LORD 2.0",
    description="War Room API. Publication requires human approval.",
    version="2.0.0",
)

orch = Orchestrator()


class ProjectBrief(BaseModel):
    """Incoming command from the dashboard."""

    goal: str = Field(..., min_length=3, description="Global objective in plain language")
    context: str = Field(default="", description="Optional constraints, market, audience")
    provocation: int = Field(default=30, ge=0, le=100)
    tone: str = Field(default="нейтраль")


class ProjectStartResponse(BaseModel):
    project_id: str
    status: str
    critical_path: list[str]
    queued_clans: list[str]
    approval: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"ok": "brain-lord", "mode": "hitl"}


@app.post("/api/project/start", response_model=ProjectStartResponse)
def project_start(brief: ProjectBrief) -> ProjectStartResponse:
    """Accept a brief, decompose it, enqueue clans.

    Does not publish. Result sits in pending_approval.
    """
    plan = orch.accept(brief.model_dump())
    return ProjectStartResponse(**plan)


@app.get("/api/system/status")
def system_status() -> dict[str, Any]:
    """Snapshot of orchestrator + cluster queues."""
    return orch.status()
