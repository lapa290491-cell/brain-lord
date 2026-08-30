# BRAIN-LORD 2.0

**Синдикат Смыслов.**  
Multi-agent система управления повесткой на базе RAG и LLM.

Это ситуационный центр (War Room): медиа, тренды, PR, антикризис.
Система готовит смысл и план. В сеть выходит только то, что подписал человек.

## Четыре слоя

1. **Dashboard** — дашборд Верховного Командующего (`/frontend`). Граф, статусы, апрув.
2. **PM-Orchestrator** — маршрут задачи и Human-in-the-Loop (`/backend` + `/agents/pm_hub`).
3. **Agent Clusters** — `psy_ops`, `media_pr`, `osint` под управлением PM Hub.
4. **RAG Knowledge Layer** — база знаний штаба (закладывается в backend).

## Быстрый старт

См. `ARCHITECTURE.md` и `CONSTITUTION.md`.

v1-визуалы остаются в `/docs` как архив.
