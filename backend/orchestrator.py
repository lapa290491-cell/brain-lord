"""PM orchestrator — decompose a brief and enqueue clusters.

No LLM. Deterministic stubs so CrewAI / LangGraph can replace
`_decompose` later without changing the public methods.
"""

from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


CLANS = ("pm_hub", "osint", "psy_ops", "media_pr")


class Orchestrator:
    """Route a commander brief through clusters, then freeze for approval.

    Lifecycle:
        draft -> review -> pending_approval -> approved | rejected

    `approved` is set only by a human. This class never publishes.
    """

    def __init__(self) -> None:
        self.projects: dict[str, dict[str, Any]] = {}
        self.queues: dict[str, deque[dict[str, Any]]] = {c: deque() for c in CLANS}
        self.agents: dict[str, str] = {
            "cpo_architect": "idle",
            "qa_risk_manager": "idle",
            "osint": "idle",
            "psy_ops": "idle",
            "media_pr": "idle",
            "trickster": "idle",
            "showrunner": "idle",
        }

    def accept(self, brief: dict[str, Any]) -> dict[str, Any]:
        """Take a brief, build a critical path, enqueue work, halt at HITL.

        Args:
            brief: dict with goal, context, provocation, tone.

        Returns:
            Public project snapshot for POST /api/project/start.
        """
        project_id = "bl-" + uuid4().hex[:8]
        path = self._decompose(brief)
        clans = self._clans_for(path)
        now = datetime.now(timezone.utc).isoformat()

        project = {
            "project_id": project_id,
            "goal": brief.get("goal", ""),
            "context": brief.get("context", ""),
            "provocation": brief.get("provocation", 30),
            "tone": brief.get("tone", "нейтраль"),
            "critical_path": path,
            "queued_clans": clans,
            "status": "review",
            "approval": "pending_approval",
            "created_at": now,
            "qa_flags": self._qa_stub(brief),
        }
        self.projects[project_id] = project

        for clan in clans:
            self.queues[clan].append(
                {"project_id": project_id, "step": clan, "state": "queued"}
            )
        self.agents["cpo_architect"] = "planning"
        self.agents["qa_risk_manager"] = "reviewing"

        return {
            "project_id": project_id,
            "status": project["status"],
            "critical_path": path,
            "queued_clans": clans,
            "approval": project["approval"],
        }

    def status(self) -> dict[str, Any]:
        """GET /api/system/status payload."""
        return {
            "agents": dict(self.agents),
            "queues": {k: len(v) for k, v in self.queues.items()},
            "projects_open": len(self.projects),
            "hitl": True,
            "publish_armed": False,
        }

    def _decompose(self, brief: dict[str, Any]) -> list[str]:
        """Stub Critical Path. Replace with CPO LLM later.

        Default path is always OSINT first, then narrative, then media draft,
        then QA, then human gate. High provocation inserts an extra QA gate.
        """
        path = [
            "osint.collect_open_sources",
            "psy_ops.frame_audience",
            "media_pr.draft_narrative",
            "pm_hub.qa_risk_review",
            "pm_hub.human_approval",
        ]
        if int(brief.get("provocation") or 0) >= 70:
            path.insert(-1, "pm_hub.qa_risk_review_strict")
        return path

    def _clans_for(self, path: list[str]) -> list[str]:
        seen: list[str] = []
        for step in path:
            clan = step.split(".", 1)[0]
            if clan in CLANS and clan not in seen:
                seen.append(clan)
        return seen

    def _qa_stub(self, brief: dict[str, Any]) -> list[str]:
        """Cheap keyword fence until qa_risk_manager.md is wired to an LLM."""
        text = (str(brief.get("goal", "")) + " " + str(brief.get("context", ""))).lower()
        flags: list[str] = []
        dirty = ("вброс", "слив компромата", "накрутка", "памп", "дамп", "pump")
        if any(w in text for w in dirty):
            flags.append("qa_block_candidate: legal_or_reputation_risk")
        if int(brief.get("provocation") or 0) >= 80:
            flags.append("qa_watch: provocation_high")
        return flags
