import os
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
MAX_ATTEMPTS = int(os.getenv("MAX_ATTEMPTS", 5))
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()
