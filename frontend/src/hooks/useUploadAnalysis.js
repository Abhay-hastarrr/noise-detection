import { useCallback, useState } from 'react'
import API from '../api/api'

function useUploadAnalysis() {
  const [file, setFile] = useState(null)
  const [simulateTamper, setSimulateTamper] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = useCallback((selectedFile) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)
  }, [])

  const handleSimulateChange = useCallback((value) => {
    setSimulateTamper(value)
  }, [])

  const submitAnalysis = useCallback(async () => {
    if (!file) {
      setError('Please select an image before submitting.')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const endpoint = simulateTamper ? 'upload/?simulate=true' : 'upload/'
      const response = await API.post(endpoint, formData)

      setResult(response.data)
      return true
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }, [file, simulateTamper])

  return {
    file,
    simulateTamper,
    result,
    loading,
    error,
    handleFileChange,
    handleSimulateChange,
    submitAnalysis,
  }
}

export default useUploadAnalysis
