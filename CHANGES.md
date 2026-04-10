# Changes

## Summary

This file documents the major changes made to the project so far.

## Backend And API

- Added frontend serving support to [app/main.py](/d:/agent/app/main.py).
- Configured FastAPI to serve the built React app from `frontend/dist`.
- Added SPA fallback routing so non-API frontend routes resolve to `index.html`.
- Kept the existing `POST /ask` API contract intact for the React frontend.
- Updated the FastAPI app title in [app/main.py](/d:/agent/app/main.py) to `TriAgent`.
- Added API error handling in [app/main.py](/d:/agent/app/main.py) so backend failures return a readable error message in the response body.
- Updated [app/llm.py](/d:/agent/app/llm.py) to validate `OPENAI_API_KEY` before making model calls.
- Switched [app/llm.py](/d:/agent/app/llm.py) from `responses.create(...)` to `chat.completions.create(...)` for a more stable submission path.
- Added an explicit error when the model returns empty content in [app/llm.py](/d:/agent/app/llm.py).
- Added structured OpenAI error handling in [app/llm.py](/d:/agent/app/llm.py) for quota errors, API status errors, and empty model responses.
- Updated [app/main.py](/d:/agent/app/main.py) to return the correct HTTP status for LLM service failures instead of collapsing them into a generic `500`.
- Switched the LLM integration from OpenAI API credentials to Groq credentials in [app/config.py](/d:/agent/app/config.py) and [app/llm.py](/d:/agent/app/llm.py).
- Added support for `LLM_PROVIDER` and `GROQ_API_KEY` in [app/config.py](/d:/agent/app/config.py).
- Updated provider-specific error messages in [app/llm.py](/d:/agent/app/llm.py) from OpenAI wording to Groq wording.
- Replaced the OpenAI-compatible Groq path with the official Groq Python SDK in [app/llm.py](/d:/agent/app/llm.py).
- Updated [requirements.txt](/d:/agent/requirements.txt) to use `groq` instead of `openai`.
- Removed `GROQ_BASE_URL` from [app/config.py](/d:/agent/app/config.py) because the official Groq SDK does not need it.
- Added a clearer `404` message in [app/llm.py](/d:/agent/app/llm.py) when `MODEL_NAME` is not recognized by Groq.

## Python 3.14 Safety Improvements

- Removed the LangChain-based backend integration from [app/llm.py](/d:/agent/app/llm.py) and [app/agents.py](/d:/agent/app/agents.py).
- Replaced LangChain usage with the official OpenAI Python SDK in [app/llm.py](/d:/agent/app/llm.py).
- Simplified agent prompting to use plain Python string templates in [app/agents.py](/d:/agent/app/agents.py).
- Updated [requirements.txt](/d:/agent/requirements.txt) to remove:
  - `langchain`
  - `langchain-openai`
- Updated [requirements.txt](/d:/agent/requirements.txt) to use:
  - `openai`
- This change was made to reduce risk from the Python 3.14 warning related to LangChain and Pydantic v1 compatibility.

## React Frontend

- Created a new React frontend in the [frontend](/d:/agent/frontend) folder using Vite.
- Replaced the default starter page with a custom UI in [frontend/src/App.jsx](/d:/agent/frontend/src/App.jsx).
- Added custom styling in [frontend/src/App.css](/d:/agent/frontend/src/App.css).
- Added shared page styling and theme variables in [frontend/src/index.css](/d:/agent/frontend/src/index.css).
- Built a UI that includes:
  - a prompt composer
  - starter prompt chips
  - three agent status cards
  - a result panel for answer, score, feedback, and warnings
- Connected the frontend to the backend `POST /ask` endpoint.
- Updated the frontend branding in [frontend/src/App.jsx](/d:/agent/frontend/src/App.jsx) to use `TriAgent`.
- Removed the phrase `React frontend for your 3-agent app` from the website.
- Improved frontend submission error handling in [frontend/src/App.jsx](/d:/agent/frontend/src/App.jsx) so API error details are shown instead of only a status code.
- Enlarged and refined the hero branding and title typography in [frontend/src/App.css](/d:/agent/frontend/src/App.css) and [frontend/src/index.css](/d:/agent/frontend/src/index.css).
- Added a large right-side `TRIAGENT` wordmark in [frontend/src/App.jsx](/d:/agent/frontend/src/App.jsx).
- Removed the duplicate top-left project name from [frontend/src/App.jsx](/d:/agent/frontend/src/App.jsx).
- Updated the right-side `TRIAGENT` wordmark font and styling in [frontend/src/App.css](/d:/agent/frontend/src/App.css) and [frontend/src/index.css](/d:/agent/frontend/src/index.css).
- Added a dedicated brand font token in [frontend/src/index.css](/d:/agent/frontend/src/index.css) for the project name treatment.

## Frontend Tooling

- Added a Vite dev proxy in [frontend/vite.config.js](/d:/agent/frontend/vite.config.js) so `/ask` requests are forwarded to `http://127.0.0.1:8000` during development.
- Installed and locked the frontend dependencies in [frontend/package.json](/d:/agent/frontend/package.json) and [frontend/package-lock.json](/d:/agent/frontend/package-lock.json).

## Run And Developer Experience

- Added [start.ps1](/d:/agent/start.ps1).
- `start.ps1` builds the frontend and starts FastAPI from the project root.
- `start.ps1` supports both `python` and `py -3`.
- Added [dev.ps1](/d:/agent/dev.ps1).
- `dev.ps1` starts FastAPI in the current terminal and Vite in a separate PowerShell window for local development.

## Documentation

- Added a project guide in [README.md](/d:/agent/README.md).
- Documented installation steps for backend and frontend dependencies.
- Documented production-style startup using [start.ps1](/d:/agent/start.ps1).
- Documented manual run steps for the backend and frontend.
- Documented one-command local development using [dev.ps1](/d:/agent/dev.ps1).
- Added notes about the new direct OpenAI SDK integration and dependency cleanup.
- Updated [README.md](/d:/agent/README.md) to document Groq environment variables, the new default model, and `404` troubleshooting for unsupported model names.
- Added Groq model-selection criteria to this file so future model changes can be made more intentionally.

## Groq Model Selection Criteria

- Use larger models when answer quality, reasoning depth, and nuanced judging matter more than speed.
- Use smaller or instant models when low latency and lower cost matter more than maximum answer quality.
- Prefer stronger models for the `JudgeAgent`, because scoring and feedback quality directly affect the retry loop.
- Prefer balanced models for the `AnswerAgent`, because it benefits from both speed and strong generation quality.
- Choose models with reliable instruction-following, since the app depends on strict output formatting for the judge response.
- If the model often breaks the `Score:` and `Feedback:` format, switch to a more reliable instruction-following model.
- If response times feel slow in the UI, try a faster Groq model before changing app logic.
- If cost or rate limits become a concern, test a smaller model while monitoring whether answer quality drops too much.
- Use a broadly capable default model for general-purpose questions, such as `llama-3.3-70b-versatile`.
- Use a faster model such as `llama-3.1-8b-instant` when responsiveness matters more than depth.
