import os
import json

class CPO_Orchestrator:
    def __init__(self, agents_dir=None):
        # Из /backend/core кланы лежат в ../../agents
        if agents_dir is None:
            here = os.path.dirname(os.path.abspath(__file__))
            agents_dir = os.path.normpath(os.path.join(here, "..", "..", "agents"))
        self.agents_dir = agents_dir
        self.active_campaigns = {}

    def load_agent_profile(self, clan, agent_filename):
        """Считывает системный промпт (инструкцию) агента из .md файла"""
        filepath = os.path.join(self.agents_dir, clan, agent_filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return f"Error: Agent {agent_filename} not found in {clan}."

    def initiate_campaign(self, campaign_name, objective):
        """Разбивает глобальную задачу по кланам"""
        campaign_id = f"CMP-{len(self.active_campaigns) + 1000}"

        # Симуляция распределения задач по дивизионам
        tasks = {
            "PM_Hub": "Построить Critical Path и рассчитать бюджеты.",
            "Mythmakers": f"Создать Лор для {campaign_name}. Адаптировать под психологию масс.",
            "Media_PR": "Сгенерировать ТЗ для видео и придумать инфоповод для СМИ.",
            "Chaos_SMM": "Подготовить мемы, сетку посева и ТЗ для UGC-креаторов в офлайне."
        }

        self.active_campaigns[campaign_id] = {
            "name": campaign_name,
            "objective": objective,
            "status": "ANALYZING",
            "tasks": tasks,
            "approval": "pending_approval"
        }
        return campaign_id, tasks
