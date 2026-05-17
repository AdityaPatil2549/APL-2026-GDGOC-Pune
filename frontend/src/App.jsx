import { useState } from 'react'
import Landing from './components/Landing/Landing'
import MatchCommandCenter from './components/MatchCommandCenter/MatchCommandCenter'

export default function App() {
  const [page, setPage] = useState('landing') // 'landing' | 'match'

  return (
    <>
      {page === 'landing' && <Landing onEnter={() => setPage('match')} />}
      {page === 'match'   && <MatchCommandCenter onBack={() => setPage('landing')} />}
    </>
  )
}
