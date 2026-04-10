class QuestionAgent:
    """Pass-through question agent"""

    def run(self, question: str) -> str:
        return question


class AnswerAgent:
    def __init__(self, llm):
        self.llm = llm
        self.prompt_template = """
You are an expert assistant.

Question:
{question}

Judge feedback (if any):
{feedback}

Produce a clear, improved answer.
"""

    def run(self, question: str, feedback: str) -> str:
        prompt = self.prompt_template.format(question=question, feedback=feedback)
        return self.llm.complete(prompt, temperature=0.3)


class JudgeAgent:
    def __init__(self, llm):
        self.llm = llm
        self.prompt_template = """
You are a strict evaluator.

Question:
{question}

Answer:
{answer}

Score the answer from 0 to 10.
Also provide clear feedback for improvement.

Respond strictly in this format:
Score: <number>
Feedback: <text>
"""

    def run(self, question: str, answer: str) -> dict:
        prompt = self.prompt_template.format(question=question, answer=answer)
        raw = self.llm.complete(prompt, temperature=0.1)

        try:
            score_line, feedback_line = raw.split("\n", 1)
            score = float(score_line.replace("Score:", "").strip())
            feedback = feedback_line.replace("Feedback:", "").strip()
        except Exception:
            score = 0.0
            feedback = "Judge parsing failed."

        return {
            "score": score,
            "feedback": feedback
        }
