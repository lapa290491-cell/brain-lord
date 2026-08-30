# ARCHITECTURE — BRAIN-LORD 2.0

## Зачем так

Дашборд должен открываться с Samsung Tab в Chrome, без Node, без npm, без локальной сборки.

## Слой 1 — Dashboard (`/frontend`)

- Чистый HTML + JS
- Tailwind CSS через CDN
- Cytoscape.js через CDN — граф кластеров, связей, прохождения сигнала
- Эстетика: конструктивизм + дарк нуар (красный / чёрный / бетон / жёлтая сечка)

## Слой 2 — PM-Orchestrator (`/backend` + `/agents/pm_hub`)

- Python
- FastAPI — API для дашборда
- CrewAI или LangGraph — граф агентов и состояния задачи
- Статусы: `draft` → `review` → `pending_approval` → `approved` | `rejected`
- Публикация только после `approved`

## Слой 3 — Agent Clusters (`/agents`)

- `pm_hub` — декомпозиция и сводка
- `psy_ops` — рамка и тон (нарратив, не тайные операции)
- `media_pr` — повестка, PR, антикризис, тренд
- `osint` — открытые источники

## Слой 4 — RAG Knowledge Layer

- Индекс брифов, тона, прошлых решений, запретов
- Подключается на шаге после скелета API
- В индекс не попадают секреты и сырые клиентские досье

## Поток

```
Командующий → Dashboard → FastAPI → PM Hub
        → clusters → сводка → pending_approval → человек
```
