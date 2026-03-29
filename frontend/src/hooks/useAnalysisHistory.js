import { useEffect, useState } from 'react'
import API from '../api/api'

function useAnalysisHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchHistory = async () => {
      try {
        const response = await API.get('history/')
        if (!isMounted) return
        setHistory(response.data || [])
      } catch (err) {
        console.error('History fetch error:', err)
        if (!isMounted) return
        setError('Unable to load history right now.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [])

  return { history, loading, error }
}

export default useAnalysisHistory
