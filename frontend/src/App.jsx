import { useEffect, useState } from 'react'
import './App.css'

const starterPrompts = [
  'Explain quantum computing in simple language.',
  'Write a concise Python function to remove duplicates from a list.',
  'Compare REST and GraphQL for a startup MVP.',
]

const agentSteps = [
  {
    id: 'question',
    title: 'Question Agent',
    description: 'Receives and forwards the prompt into the workflow.',
  },
  {
    id: 'answer',
    title: 'Answer Agent',
    description: 'Drafts and improves the response using judge feedback.',
  },
  {
    id: 'judge',
    title: 'Judge Agent',
    description: 'Scores the answer and suggests what to improve next.',
  },
]

function ScoreRing({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(10, Number(score) || 0))
  const rotation = `${safeScore * 36}deg`
  const tone =
    safeScore >= 8 ? 'great' : safeScore >= 5 ? 'steady' : 'alert'

  return (
    <div className={`score-ring ${tone}`} aria-label={`Score ${safeScore} out of 10`}>
      <div
        className="score-ring-fill"
        style={{ '--score-rotation': rotation }}
      />
      <div className="score-ring-core">
        <strong>{safeScore.toFixed(1)}</strong>
        <span>/10</span>
      </div>
    </div>
  )
}

function App() {
  const [question, setQuestion] = useState(starterPrompts[0])
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (status !== 'loading') {
      setActiveStep(0)
      return undefined
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % agentSteps.length)
    }, 1200)

    return () => window.clearInterval(interval)
  }, [status])

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      setError('Enter a question before running the agent pipeline.')
      return
    }

    setStatus('loading')
    setError('')

    try {
      const response = await fetch('/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion }),
      })

      if (!response.ok) {
        let message = `Request failed with status ${response.status}.`

        try {
          const errorPayload = await response.json()
          if (typeof errorPayload?.detail === 'string' && errorPayload.detail) {
            message = errorPayload.detail
          }
        } catch {
          // Keep the fallback message if the response body isn't JSON.
        }

        throw new Error(message)
      }

      const data = await response.json()
      setResult(data)
      setStatus('success')
      setActiveStep(2)
    } catch (requestError) {
      setStatus('error')
      setResult(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The request failed unexpectedly.',
      )
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-lead">
          <div className="hero-copy">
            <h1 className="hero-title">Turn the pipeline into a productized experience.</h1>
            <p className="hero-text">
              Ask one question and watch the Question, Answer, and Judge agents
              work through a loop that aims for a higher-quality response.
            </p>
          </div>

          <div className="hero-wordmark" aria-hidden="true">
            TRIAGENT
          </div>
        </div>

        <div className="hero-grid">
          {agentSteps.map((step, index) => (
            <article
              key={step.id}
              className={`agent-card ${status === 'loading' && activeStep === index ? 'active' : ''}`}
            >
              <span className="agent-index">0{index + 1}</span>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="composer-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Ask the system</p>
              <h2>Run a question through all three agents</h2>
            </div>
            <span className={`status-pill ${status}`}>
              {status === 'loading' && 'Running'}
              {status === 'success' && 'Completed'}
              {status === 'error' && 'Error'}
              {status === 'idle' && 'Ready'}
            </span>
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <label className="label" htmlFor="question">
              Prompt
            </label>
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything you want the three-agent loop to answer."
              rows="7"
            />

            <div className="prompt-pills" aria-label="Starter prompts">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="prompt-pill"
                  type="button"
                  onClick={() => setQuestion(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="composer-actions">
              <button className="primary-button" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Running agents...' : 'Ask the agents'}
              </button>
              <p className="helper-text">
                The Judge agent scores the answer and sends improvement feedback
                back into the loop until it reaches the quality threshold.
              </p>
            </div>
          </form>

          {error ? <p className="error-banner">{error}</p> : null}
        </div>

        <aside className="result-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Result</p>
              <h2>What the pipeline produced</h2>
            </div>
          </div>

          {result ? (
            <div className="result-content">
              <div className="score-block">
                <ScoreRing score={result.score} />
                <div>
                  <p className="mini-label">Judge score</p>
                  <h3>
                    {result.score >= 8
                      ? 'Passed the quality bar'
                      : 'Needs another pass'}
                  </h3>
                  <p className="muted">
                    The backend loops until the score reaches 8.0 or max
                    attempts are exhausted.
                  </p>
                </div>
              </div>

              <div className="result-section">
                <p className="mini-label">Final question</p>
                <p>{result.question}</p>
              </div>

              <div className="result-section">
                <p className="mini-label">Answer</p>
                <p className="answer-copy">{result.answer}</p>
              </div>

              <div className="result-section">
                <p className="mini-label">Judge feedback</p>
                <p>{result.feedback}</p>
              </div>

              {result.warning ? (
                <div className="warning-box">
                  <p className="mini-label">Warning</p>
                  <p>{result.warning}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">
              <p className="mini-label">Waiting for a run</p>
              <h3>No result yet</h3>
              <p>
                Submit a prompt to see the drafted answer, judge score, and
                improvement feedback.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}

export default App
