from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.llm import LLMServiceError
from app.pipeline import run_pipeline

app = FastAPI(title="TriAgent")
frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    question: str
    answer: str
    score: float
    feedback: str
    warning: str | None = None

@app.post("/ask", response_model=AnswerResponse)
def ask_question(payload: QuestionRequest):
    try:
        return run_pipeline(payload.question)
    except LLMServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"

    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        requested_path = frontend_dist / full_path
        if full_path and requested_path.is_file():
            return FileResponse(requested_path)
        return FileResponse(frontend_dist / "index.html")
