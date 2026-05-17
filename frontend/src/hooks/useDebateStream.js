import { useState, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const INITIAL_DEBATE = {
  stats_analyst:      null,
  strategist:         null,
  devils_advocate:    null,
  strategist_revised: null,
  commentator:        null,
}

export function useDebateStream() {
  const [debate, setDebate] = useState(INITIAL_DEBATE)
  const [status, setStatus] = useState('idle')  // idle | running | complete | error
  const [captainsCall, setCaptainsCall] = useState(null)
  const [error, setError] = useState(null)
  const eventSourceRef = useRef(null)
  const streamBuffers = useRef({})

  const updateAgent = (agentId, patch) => {
    setDebate(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...patch }
    }))
  }

  const startStream = useCallback(async (matchState) => {
    // Close any existing stream
    if (eventSourceRef.current) eventSourceRef.current.close()
    setDebate(INITIAL_DEBATE)
    setCaptainsCall(null)
    setError(null)
    setStatus('running')
    streamBuffers.current = {}

    try {
      // Use fetch with ReadableStream for SSE (better control)
      const resp = await fetch(`${API_BASE}/api/strategize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify(matchState),
      })

      if (!resp.ok) throw new Error(`Server error: ${resp.status}`)

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const processEvent = (eventStr) => {
        const lines = eventStr.split('\n')
        let type = '', data = ''
        for (const line of lines) {
          if (line.startsWith('event:')) type = line.slice(6).trim()
          if (line.startsWith('data:'))  data = line.slice(5).trim()
        }
        if (!type || !data) return

        try {
          const payload = JSON.parse(data)

          if (type === 'agent_start') {
            streamBuffers.current[payload.agent] = ''
            setDebate(prev => ({
              ...prev,
              [payload.agent]: { agentId: payload.agent, content: '', status: 'thinking', toolCall: null }
            }))
          }

          if (type === 'agent_token') {
            streamBuffers.current[payload.agent] = (streamBuffers.current[payload.agent] || '') + payload.token
            setDebate(prev => ({
              ...prev,
              [payload.agent]: {
                ...prev[payload.agent],
                content: streamBuffers.current[payload.agent],
                status: 'streaming',
              }
            }))
          }

          if (type === 'agent_complete') {
            setDebate(prev => ({
              ...prev,
              [payload.agent]: { ...prev[payload.agent], status: 'complete' }
            }))
          }

          if (type === 'tool_call') {
            setDebate(prev => ({
              ...prev,
              stats_analyst: {
                ...prev.stats_analyst,
                toolCall: {
                  source: payload.source || 'Cricbuzz API',
                  label: payload.label || 'Fetching match data…',
                  progress: payload.progress || 0,
                }
              }
            }))
          }

          if (type === 'captains_call') {
            setCaptainsCall(payload)
          }

          if (type === 'done') {
            setStatus('complete')
          }

          if (type === 'error') {
            setError(payload.message)
            setStatus('error')
          }

        } catch (err) {
          console.error('SSE parse error', err, data)
        }
      }

      // Read stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        events.forEach(processEvent)
      }

    } catch (err) {
      console.error('Stream error:', err)
      setError(err.message)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close()
    setDebate(INITIAL_DEBATE)
    setCaptainsCall(null)
    setError(null)
    setStatus('idle')
    streamBuffers.current = {}
  }, [])

  return { debate, status, captainsCall, error, startStream, reset }
}
