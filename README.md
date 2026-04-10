# TriAgent

This project is a FastAPI backend with a React frontend for a 3-agent workflow:

- `QuestionAgent` receives the prompt
- `AnswerAgent` drafts and improves the answer
- `JudgeAgent` scores the answer and provides feedback

The backend now uses the official Groq Python SDK directly, which keeps the integration simpler and avoids the earlier LangChain path.

The frontend submits a question to `POST /ask` and displays the answer, score, feedback, and any retry warning.

## Project Structure

- [app/main.py](/d:/agent/app/main.py)
- [app/pipeline.py](/d:/agent/app/pipeline.py)
- [app/agents.py](/d:/agent/app/agents.py)
- [frontend/src/App.jsx](/d:/agent/frontend/src/App.jsx)
- [frontend/vite.config.js](/d:/agent/frontend/vite.config.js)

## Requirements

- Python 3.10+
- Node.js 18+
- A Groq API key in `.env`

Example `.env`:

```env
LLM_PROVIDER=provider_name
GROQ_API_KEY=your_key_here
MODEL_NAME=model_name
MAX_ATTEMPTS=5
```

## Install

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Install frontend dependencies:

```powershell
cd frontend
npm install
cd ..
```

## Run The App

### Option 1: One-command launcher

From the project root:

```powershell
.\start.ps1
```

What it does:

- installs no new packages
- builds the React frontend
- starts FastAPI with Uvicorn on `http://127.0.0.1:8000`

Optional flags:

```powershell
.\start.ps1 -SkipBuild
.\start.ps1 -ServerHost 0.0.0.0 -Port 8000
```

### Option 2: Run manually

Build the frontend:

```powershell
cd frontend
npm run build
cd ..
```

Start the backend:

```powershell
python -m uvicorn app.main:app --reload
```

If `python` is not available on your Windows setup, use:

```powershell
py -3 -m uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000
```

## Frontend Development

To work on the React app with Vite dev server:

```powershell
cd frontend
npm run dev
```

The Vite config proxies `/ask` to `http://127.0.0.1:8000`, so run the FastAPI backend separately in another terminal:

```powershell
python -m uvicorn app.main:app --reload
```

### One-command local development

If you want both servers to run together during development, use:

```powershell
.\dev.ps1
```

What it does:

- starts FastAPI with reload on `http://127.0.0.1:8000`
- starts the Vite dev server in a second PowerShell window
- lets you edit Python and React code with live reload on both sides

Open the frontend at:

```text
http://127.0.0.1:5173
```

Optional flags:

```powershell
.\dev.ps1 -FrontendPort 5173 -ApiPort 8000
.\dev.ps1 -ServerHost 0.0.0.0 -FrontendPort 5173 -ApiPort 8000
```

## Notes

- FastAPI serves the built frontend from `frontend/dist` in production-style runs.
- If you change the React UI and want FastAPI to reflect it, rebuild with `npm run build`.
- If you previously used an OpenAI API key, replace it with `GROQ_API_KEY` and restart the backend.
- If Groq returns a `404`, the most likely cause is an unsupported `MODEL_NAME`. Update it to a Groq-supported model in `.env`.
- If you previously installed `langchain` or `langchain-openai`, you can remove them from your virtual environment after reinstalling from [requirements.txt](/d:/agent/requirements.txt).
