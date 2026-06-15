# LabelForge Pro

LabelForge Pro is a production-style full-stack AI data labeling platform with a React frontend and FastAPI backend. It is designed as a portfolio-grade starter that can be extended into a client deliverable or SaaS MVP.

## Core Features

- JWT-style authentication
- Project creation with custom label taxonomy
- CSV dataset upload
- Automatic heuristic AI pre-labeling
- Human review and annotation workspace
- Notes for each record
- Analytics dashboard with label breakdown
- Export labeled results as CSV
- Modern React + TypeScript UI
- FastAPI + SQLAlchemy backend

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Axios
- Recharts

### Backend
- FastAPI
- SQLAlchemy
- SQLite (easy local start)
- Passlib + JOSE for auth
- Pandas-ready data layer

## Project Structure

```text
annotation_studio_pro/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── start_backend.bat
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── start_frontend.bat
├── sample_dataset.csv
└── README.md
```

## How to Run

### 1) Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://127.0.0.1:5173
```

## CSV Format

Your CSV must include a `content` column.

Example:

```csv
id,content,source
1,Free discount available now click this link,promo
2,Team meeting moved to 4 PM today,internal
```

## Good Sales Angles for This Project

You can position this as:

- AI data labeling dashboard for startups
- Internal QA review tool for annotation teams
- Dataset review and export system for LLM fine-tuning pipelines
- Human-in-the-loop moderation tool
- Text classification operations dashboard

## Strong Upgrade Ideas

If you want to make this even more sellable, add:

- Team roles and multi-annotator support
- Admin dashboard
- Audit logs
- Record filters and search
- File storage with S3 or Supabase
- PostgreSQL instead of SQLite
- Docker deployment
- LLM integration using OpenAI / Gemini / local models
- Model evaluation view with confusion matrix and precision/recall
- Agreement scoring across annotators

## Resume Bullet

Built a full-stack AI data labeling platform using React, TypeScript, FastAPI, and SQLAlchemy with authentication, dataset upload, heuristic AI pre-labeling, human review workflows, analytics, and CSV export for annotation operations.
