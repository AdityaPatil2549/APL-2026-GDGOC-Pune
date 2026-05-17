import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const INITIAL_DEBATE = {
  stats_analyst:      null,
  strategist:         null,
  devils_advocate:    null,
  strategist_revised: null,
  commentator:        null,
}

export function useDebateStream() {
  const [debate, setDebate]           = useState(INITIAL_DEBATE)
  const [status, setStatus]           = useState('idle')
  const [captainsCall, setCaptainsCall] = useState(null)
  const [error, setError]             = useState(null)
  const [retryInfo, setRetryInfo]     = useState(null)  // {agent, attempt, wait}
  const [overrideActive, setOverrideActive] = useState(false)
  const streamBuffers = useRef({})
  const readerRef     = useRef(null)

  const processEvent = useCallback((eventStr) => {
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
              source:   payload.source || 'API',
              label:    payload.label  || 'Fetching…',
              progress: payload.progress || 0,
            }
          }
        }))
      }

      if (type === 'retry') {
        setRetryInfo({ agent: payload.agent, attempt: payload.attempt, wait: payload.wait })
        setTimeout(() => setRetryInfo(null), (payload.wait + 2) * 1000)
      }

      if (type === 'override_injected') {
        setOverrideActive(true)
        setTimeout(() => setOverrideActive(false), 5000)
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
      console.error('SSE parse error:', err, data)
    }
  }, [])

  const startStream = useCallback(async (matchState) => {
    if (readerRef.current) {
      try { readerRef.current.cancel() } catch {}
    }
    setDebate(INITIAL_DEBATE)
    setCaptainsCall(null)
    setError(null)
    setRetryInfo(null)
    setStatus('running')
    streamBuffers.current = {}

    try {
      const resp = await fetch(`${API_BASE}/api/strategize`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body:    JSON.stringify(matchState),
      })
      if (!resp.ok) throw new Error(`Server ${resp.status}: ${await resp.text()}`)

      const reader = resp.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        events.forEach(processEvent)
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Stream error:', err)
        setError(err.message)
        setStatus('error')
      }
    }
  }, [processEvent])

  const reset = useCallback(() => {
    if (readerRef.current) {
      try { readerRef.current.cancel() } catch {}
      readerRef.current = null
    }
    setDebate(INITIAL_DEBATE)
    setCaptainsCall(null)
    setError(null)
    setRetryInfo(null)
    setOverrideActive(false)
    setStatus('idle')
    streamBuffers.current = {}
  }, [])

  return { debate, status, captainsCall, error, retryInfo, overrideActive, startStream, reset }
}
