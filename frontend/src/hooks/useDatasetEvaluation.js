import { useEffect, useState } from 'react'
import API from '../api/api'

function useDatasetEvaluation() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchEvaluation = async () => {
      try {
        const response = await API.get('dataset-evaluation/')
        if (!isMounted) return
        if (response.data?.has_data) {
          setMetrics(response.data.metrics)
        } else {
          setMetrics(null)
        }
      } catch (err) {
        console.error('Dataset evaluation fetch error:', err)
        if (!isMounted) return
        setError('Unable to load dataset evaluation results.')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    fetchEvaluation()

    return () => {
      isMounted = false
    }
  }, [])

  return { metrics, loading, error }
}

export default useDatasetEvaluation
