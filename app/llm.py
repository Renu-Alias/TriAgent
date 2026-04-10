import os

from groq import APIStatusError, Groq, RateLimitError

from app.config import LLM_PROVIDER, MODEL_NAME


class LLMServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code


class SharedLLM:
    def __init__(self):
        if LLM_PROVIDER != "groq":
            raise LLMServiceError(
                f"Unsupported LLM_PROVIDER '{LLM_PROVIDER}'. Expected 'groq'.",
                status_code=500,
            )

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise LLMServiceError("GROQ_API_KEY is not set in the environment.", status_code=500)

        self.client = Groq(api_key=api_key)
        self.model = MODEL_NAME

    def complete(self, prompt: str, temperature: float = 0.3) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                temperature=temperature,
            )
            content = response.choices[0].message.content
        except RateLimitError as exc:
            raise LLMServiceError(
                "Groq quota or rate limit exceeded. Check your Groq plan, limits, or API key, then try again.",
                status_code=429,
            ) from exc
        except APIStatusError as exc:
            if exc.status_code == 404:
                raise LLMServiceError(
                    f"Groq could not find the model '{self.model}'. Update MODEL_NAME in .env to a currently supported Groq model.",
                    status_code=404,
                ) from exc
            raise LLMServiceError(
                f"Groq API request failed with status {exc.status_code}.",
                status_code=exc.status_code or 500,
            ) from exc
        except Exception as exc:
            raise LLMServiceError(
                f"Groq request failed: {exc}",
                status_code=500,
            ) from exc

        if not content:
            raise LLMServiceError("The model returned an empty response.", status_code=502)

        return content.strip()


def get_shared_llm():
    return SharedLLM()
