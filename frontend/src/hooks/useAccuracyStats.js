import { useEffect, useState } from 'react'
import API from '../api/api'

function useAccuracyStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchAccuracy = async () => {
      try {
        const response = await API.get('accuracy/')
        if (!isMounted) return
        setStats(response.data)
      } catch (err) {
        console.error('Accuracy fetch error:', err)
        if (!isMounted) return
        setError('Unable to load accuracy data.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    fetchAccuracy()

    return () => {
      isMounted = false
    }
  }, [])

  return { stats, loading, error }
}

export default useAccuracyStats
