from app.llm import get_shared_llm
from app.config import MAX_ATTEMPTS
from app.agents import QuestionAgent, AnswerAgent, JudgeAgent

def run_pipeline(question: str) -> dict:
    llm = get_shared_llm()
    q_agent = QuestionAgent()
    a_agent = AnswerAgent(llm)
    j_agent = JudgeAgent(llm)

    q = q_agent.run(question)
    feedback = "No feedback yet. Please provide a high-quality answer."
    
    final_answer = ""
    final_score = 0.0
    final_feedback = ""
    warning = None

    for attempt in range(MAX_ATTEMPTS):
        # generate answer
        answer = a_agent.run(question=q, feedback=feedback)
        
        # judge the drafted answer
        judge_result = j_agent.run(question=q, answer=answer)
        score = judge_result.get("score", 0.0)
        feedback = judge_result.get("feedback", "")
        
        final_answer = answer
        final_score = score
        final_feedback = feedback

        # Good enough threshold
        if score >= 8.0:
            break
    else:
        warning = f"Max attempts ({MAX_ATTEMPTS}) reached. Score is {final_score}/10."

    return {
        "question": q,
        "answer": final_answer,
        "score": final_score,
        "feedback": final_feedback,
        "warning": warning
    }
