import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, AlertTriangle, Calendar, BarChart3, Info, FileText, Zap, Camera, Eye, Sparkles, Copy, Flame, Radar } from 'lucide-react'
import { toast } from 'react-toastify'
import Card from '../components/common/Card'

function ConfidenceBar({ value, label, color = 'purple' }) {
  const percentage = typeof value === 'number' ? Math.min(value * 100, 100) : 0
  const colorClass = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-sm font-bold text-gradient-accent">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function ImageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/analysis/${id}/`)
        if (!response.ok) throw new Error('Failed to fetch analysis')
        const data = await response.json()
        setAnalysis(data)
        toast.success('Analysis loaded successfully!', { autoClose: 2000 })
      } catch (err) {
        setError(err.message)
        toast.error(`Error: ${err.message}`, { autoClose: 3000 })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-16 text-center glass" variant="elevated">
          <div className="inline-block mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-purple-500"></div>
          </div>
          <p className="text-lg font-semibold text-gray-300">Loading analysis...</p>
        </Card>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>
        <Card className="p-8 glass bg-red-500/10 border-red-500/30" variant="default">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Error Loading Analysis
            </p>
            <p className="text-sm text-red-200">{error || 'Analysis not found'}</p>
          </div>
        </Card>
      </div>
    )
  }

  const isPredictedTampered = analysis.predicted_result === true
  const isPredictedClean = analysis.predicted_result === false
  const isActualTampered = analysis.actual_result === true
  const createdAt = analysis.created_at ? new Date(analysis.created_at).toLocaleString() : '—'
  const confidence = analysis.confidence ? Math.min(analysis.confidence * 100, 100).toFixed(1) : 0

  const hasActualResult = analysis.actual_result !== null
  const isCorrect = hasActualResult && (isPredictedTampered === isActualTampered)

  const predictedBadge = isPredictedTampered ? (
    <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Tampered</span>
  ) : isPredictedClean ? (
    <span className="badge-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Clean</span>
  ) : (
    <span className="text-gray-400">Unknown</span>
  )

  const actualBadge = isActualTampered ? (
    <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Tampered</span>
  ) : (
    <span className="badge-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Clean</span>
  )

  const metadataImageInfo = analysis.metadata_image_info || {}
  const metadataFileInfo = analysis.metadata_file_info || {}
  const metadataExif = analysis.exif_data || {}
  const metadataAnalysis = analysis.metadata_analysis || []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'metrics', label: 'Detection Metrics', icon: BarChart3 },
    { id: 'metadata', label: 'Metadata', icon: FileText },
  ]

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </button>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-gradient">Analysis Details</h1>
        <p className="text-gray-400 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" /> {createdAt}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-violet-400 border-b-2 border-violet-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Image Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Image */}
            {analysis.original_image && (
              <Card className="p-6 space-y-4" variant="elevated">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <h2 className="text-xl font-bold text-white">Original Image</h2>
                </div>
                <img
                  src={analysis.original_image}
                  alt="Original"
                  className="w-full h-auto rounded-lg border border-white/10 object-cover shadow-xl shadow-purple-500/10 max-h-96"
                />
              </Card>
            )}

            {/* Tampered Image Comparison */}
            {analysis.tampered_image && (
              <Card className="p-6 space-y-4" variant="elevated">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-bold text-white">Tampered/Reference Image</h2>
                </div>
                <img
                  src={analysis.tampered_image}
                  alt="Tampered"
                  className="w-full h-auto rounded-lg border border-white/10 object-cover shadow-xl shadow-pink-500/10 max-h-96"
                />
                {analysis.modification_type && (
                  <div className="glass-sm rounded-lg p-4 space-y-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Modification Type</p>
                    <p className="text-lg font-bold text-gradient-accent capitalize">{analysis.modification_type}</p>
                  </div>
                )}
              </Card>
            )}

            {/* ELA Visualization */}
            {analysis.ela_image && (
              <Card className="p-6 space-y-4" variant="elevated">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Error Level Analysis</h2>
                </div>
                <img
                  src={analysis.ela_image}
                  alt="ELA"
                  className="w-full h-auto rounded-lg border border-white/10 object-cover shadow-xl shadow-orange-500/10"
                />
              </Card>
            )}

            {/* Clone Heatmap */}
            {analysis.heatmap_image && (
              <Card className="p-6 space-y-4" variant="elevated">
                <div className="flex items-center gap-2">
                  <Radar className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white">Clone Heatmap</h2>
                </div>
                <img
                  src={analysis.heatmap_image}
                  alt="Clone Heatmap"
                  className="w-full h-auto rounded-lg border border-white/10 object-cover shadow-xl shadow-cyan-500/10"
                />
              </Card>
            )}
          </div>

          {/* Right - Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Result */}
            <Card className="p-6 space-y-4 border-t-2 border-t-violet-500" variant="elevated">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                Prediction
              </h3>
              <div className="space-y-3">
                <div className="glass-sm rounded-lg p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Result</p>
                  <div className="text-2xl font-bold">{predictedBadge}</div>
                </div>

                {analysis.confidence !== null && (
                  <div className="glass-sm rounded-lg p-4 space-y-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Overall Confidence</p>
                    <p className="text-3xl font-black text-gradient-accent">{confidence}%</p>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${Math.min(confidence, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {analysis.decision_reason && (
                  <div className="glass-sm rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Decision Rationale</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{analysis.decision_reason}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Ground Truth */}
            {hasActualResult && (
              <Card className="p-6 space-y-4 border-t-2 border-t-blue-500" variant="elevated">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Ground Truth
                </h3>
                <div className="space-y-3">
                  <div className="glass-sm rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Actual Result</p>
                    <div className="text-2xl font-bold">{actualBadge}</div>
                  </div>

                  <div className={`glass-sm rounded-lg p-4 space-y-2 ${isCorrect ? 'border-l-2 border-green-500' : 'border-l-2 border-red-500'}`}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Accuracy</p>
                    {isCorrect ? (
                      <p className="text-lg font-bold text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5" /> Correct
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-5 h-5" /> Incorrect
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Info */}
            <Card className="p-6 space-y-3" variant="elevated">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Information
              </h3>
              <div className="space-y-2 text-xs">
                <div className="glass-sm rounded-lg p-3 space-y-1">
                  <p className="text-gray-400 uppercase tracking-widest font-medium">Analysis ID</p>
                  <p className="text-gray-200 font-mono text-sm">#{analysis.id}</p>
                </div>

                <div className="glass-sm rounded-lg p-3 space-y-1">
                  <p className="text-gray-400 uppercase tracking-widest font-medium">Created</p>
                  <p className="text-gray-200 text-xs">{createdAt}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Detection Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <Card className="p-8 space-y-6" variant="elevated">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-violet-400" />
                Detection Metrics
              </h2>
              <p className="text-sm text-gray-400">Individual confidence scores from each analysis module</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Main Metrics */}
              <div className="space-y-4">
                <ConfidenceBar 
                  value={analysis.confidence} 
                  label="Overall Confidence" 
                  color="purple"
                />
                <ConfidenceBar 
                  value={analysis.noise_confidence} 
                  label="Noise Detection" 
                  color="blue"
                />
                <ConfidenceBar 
                  value={analysis.clone_confidence} 
                  label="Clone Detection" 
                  color="green"
                />
                <ConfidenceBar 
                  value={analysis.metadata_confidence} 
                  label="Metadata Analysis" 
                  color="yellow"
                />
              </div>

              {/* Detection Status */}
              <div className="space-y-4">
                <div className="glass-sm rounded-lg p-5 space-y-3">
                  <h3 className="font-bold text-white">Detection Results</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Noise Detected</span>
                      {analysis.noise_tampered ? (
                        <span className="badge-danger flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="badge-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> No
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Clone Detected</span>
                      {analysis.clone_tampered ? (
                        <span className="badge-danger flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="badge-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> No
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Metadata Anomaly</span>
                      {analysis.metadata_tampered ? (
                        <span className="badge-danger flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="badge-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> No
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Algorithm Notes */}
                {analysis.metadata_details && (
                  <div className="glass-sm rounded-lg p-5 space-y-2">
                    <h3 className="font-bold text-white text-sm">Metadata Notes</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{analysis.metadata_details}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis Notes */}
          {metadataAnalysis && metadataAnalysis.length > 0 && (
            <Card className="p-8 space-y-4" variant="elevated">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Analysis Findings
              </h2>
              <ul className="space-y-2">
                {metadataAnalysis.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-violet-400 flex-shrink-0 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <div className="space-y-6">
          {/* EXIF Data */}
          {Object.keys(metadataExif).length > 0 && (
            <Card className="p-8 space-y-6" variant="elevated">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Camera className="w-6 h-6 text-violet-400" />
                  EXIF Metadata
                </h2>
                <p className="text-sm text-gray-400">Camera and image capture information</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(metadataExif).map(([key, value]) => (
                  <div key={key} className="glass-sm rounded-lg p-4 space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{key}</p>
                    <p className="text-sm text-white break-words">{String(value).substring(0, 50)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Image Info */}
          <Card className="p-8 space-y-6" variant="elevated">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Info className="w-6 h-6 text-violet-400" />
                Image Information
              </h2>
              <p className="text-sm text-gray-400">Technical properties of the image file</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {metadataImageInfo.format && (
                  <div className="glass-sm rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Format</p>
                    <p className="text-lg font-semibold text-white">{metadataImageInfo.format}</p>
                  </div>
                )}

                {metadataImageInfo.width && metadataImageInfo.height && (
                  <div className="glass-sm rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Resolution</p>
                    <p className="text-lg font-semibold text-white">
                      {metadataImageInfo.width} × {metadataImageInfo.height}
                    </p>
                  </div>
                )}

                {metadataImageInfo.mode && (
                  <div className="glass-sm rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Color Mode</p>
                    <p className="text-lg font-semibold text-white">{metadataImageInfo.mode}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {metadataFileInfo.size_kb && (
                  <div className="glass-sm rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">File Size</p>
                    <p className="text-lg font-semibold text-white">{metadataFileInfo.size_kb} KB</p>
                  </div>
                )}

                {metadataFileInfo.created && (
                  <div className="glass-sm rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Created</p>
                    <p className="text-sm text-white">{metadataFileInfo.created}</p>
                  </div>
                )}

                {metadataFileInfo.modified && (
                  <div className="glass-sm rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Modified</p>
                    <p className="text-sm text-white">{metadataFileInfo.modified}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Raw Metadata */}
          {analysis.metadata && (
            <Card className="p-8 space-y-6" variant="elevated">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    Full Metadata Object
                  </h2>
                  <p className="text-sm text-gray-400">Complete metadata in JSON format</p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(analysis.metadata, null, 2))
                    toast.success('Metadata copied to clipboard!', {
                      position: 'top-right',
                      autoClose: 2000,
                    })
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </button>
              </div>

              <pre className="bg-black/50 rounded-lg p-6 overflow-auto font-mono text-xs text-gray-300 border border-white/10 max-h-96">
                {JSON.stringify(analysis.metadata, null, 2)}
              </pre>

              {/* Metadata Statistics */}
              {analysis.metadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                  <div className="glass-sm rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Top Level Keys</p>
                    <p className="text-2xl font-bold text-gradient-accent mt-1">
                      {Object.keys(analysis.metadata).length}
                    </p>
                  </div>

                  {analysis.metadata.exif && (
                    <div className="glass-sm rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">EXIF Data</p>
                      <p className="text-2xl font-bold text-gradient-accent mt-1">
                        {Object.keys(analysis.metadata.exif).length}
                      </p>
                    </div>
                  )}

                  {analysis.metadata.image_info && (
                    <div className="glass-sm rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Image Info</p>
                      <p className="text-2xl font-bold text-gradient-accent mt-1">
                        {Object.keys(analysis.metadata.image_info).length}
                      </p>
                    </div>
                  )}

                  {analysis.metadata.analysis && (
                    <div className="glass-sm rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Findings</p>
                      <p className="text-2xl font-bold text-gradient-accent mt-1">
                        {Array.isArray(analysis.metadata.analysis) ? analysis.metadata.analysis.length : 0}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageDetail
