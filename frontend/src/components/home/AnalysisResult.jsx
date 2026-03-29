import Card from '../common/Card'
import { Target, BarChart3, FileText, Image, CheckCircle2, AlertTriangle, Search, Camera, HardDrive, AlertCircle, Flame, Radar } from 'lucide-react'

const metricConfig = [
  { key: 'predicted_result', label: 'Predicted Result' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'noise_confidence', label: 'Noise Confidence' },
  { key: 'clone_confidence', label: 'Clone Confidence' },
  { key: 'metadata_confidence', label: 'Metadata Confidence' },
]

function formatPredicted(value) {
  if (value === null || value === undefined) return '—'
  return value ? 'Tampered' : 'Clean'
}

function getPredictedBadge(value) {
  const text = formatPredicted(value)
  if (text === 'Tampered') {
    return <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {text}</span>
  }
  if (text === 'Clean') {
    return <span className="badge-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {text}</span>
  }
  return <span className="text-gray-400">{text}</span>
}

function formatValue(key, value) {
  if (key === 'predicted_result') {
    return getPredictedBadge(value)
  }

  if (typeof value === 'number') {
    return value > 0 ? `${(value * 100).toFixed(1)}%` : value
  }

  return value ?? '—'
}

function AnalysisResult({ result }) {
  if (!result) return null

  const confidence = result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '—'
  const metadataPayload = result.metadata ?? {
    exif: result.metadata_exif ?? {},
    image_info: result.metadata_image_info ?? {},
    file_info: result.metadata_file_info ?? {},
    analysis: result.metadata_analysis ?? (result.metadata_details ? [result.metadata_details] : []),
  }

  const forensicVisuals = [
    result.image_url && {
      id: 'original',
      title: 'Original Image',
      description: 'Uploaded input',
      icon: Image,
      src: result.image_url,
    },
    result.ela_image && {
      id: 'ela',
      title: 'ELA Visualization',
      description: 'Error Level Analysis',
      icon: Flame,
      src: result.ela_image,
    },
    result.heatmap_image && {
      id: 'heatmap',
      title: 'Clone Heatmap',
      description: 'Copy-move hotspots',
      icon: Radar,
      src: result.heatmap_image,
    },
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className="p-8 space-y-6" variant="elevated">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-violet-400" />
            <h2 className="text-3xl font-bold text-gradient">Analysis Complete</h2>
          </div>
          <p className="text-sm text-gray-400">Detailed results from the image analysis</p>
        </div>

        {/* Result Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Predicted Result - Large */}
            <div className="glass-sm rounded-xl p-6 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Detection Result</p>
              <div className="text-2xl font-bold">
                {getPredictedBadge(result.predicted_result)}
              </div>
            </div>

            {/* Overall Confidence */}
            <div className="glass-sm rounded-xl p-6 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Overall Confidence</p>
              <div className="text-2xl font-bold text-gradient-accent">{confidence}</div>
            </div>
          </div>

          {result.decision_reason && (
            <div className="glass-sm rounded-xl p-6 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Decision Rationale</p>
              <p className="text-sm text-gray-200 leading-relaxed">{result.decision_reason}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Metrics */}
      <Card className="p-8 space-y-6" variant="elevated">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-violet-400" />
            <h3 className="text-xl font-bold text-white">Confidence Breakdown</h3>
          </div>
          <p className="text-sm text-gray-400">Individual analysis metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricConfig.map(({ key, label }) => {
            if (key === 'predicted_result') return null
            const value = result[key]
            return (
              <div key={key} className="glass-sm rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold text-gradient-accent">
                  {typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value ?? '—'}
                </p>
              </div>
            )
          })}
        </div>

        {/* Metadata Details */}
        {result.metadata_details && (
          <div className="glass-sm rounded-lg p-6 space-y-3">
            <p className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4" /> Metadata Details</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.metadata_details}</p>
          </div>
        )}
      </Card>

      {/* Metadata Panel */}
      <MetadataPanel metadata={metadataPayload} />

      {/* Forensic Visuals */}
      {forensicVisuals.length > 0 && (
        <Card className="p-8 space-y-6" variant="elevated">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Forensic Visuals</h3>
            </div>
            <p className="text-sm text-gray-400">Original reference and generated overlays</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {forensicVisuals.map(({ id, ...visual }) => (
              <ForensicImage key={id} {...visual} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AnalysisResult

function MetadataPanel({ metadata }) {
  if (!metadata) return null

  const exifEntries = metadata.exif ?? {}
  const imageInfo = metadata.image_info ?? {}
  const fileInfo = metadata.file_info ?? {}
  const analysisItems = metadata.analysis ?? []

  return (
    <div className="metadata-panel space-y-5">
      <h2 className="flex items-center gap-2"><Search className="w-5 h-5 text-violet-400" /> Metadata Analysis</h2>

      <div className="metadata-section">
        <h3 className="flex items-center gap-2"><Camera className="w-4 h-4 text-violet-400" /> EXIF Metadata</h3>
        {Object.keys(exifEntries).length === 0 ? (
          <p>No EXIF metadata found</p>
        ) : (
          <div className="metadata-grid">
            {Object.entries(exifEntries).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {String(value)}</p>
            ))}
          </div>
        )}
      </div>

      <div className="metadata-section">
        <h3 className="flex items-center gap-2"><Image className="w-4 h-4 text-violet-400" /> Image Info</h3>
        <p>Format: {imageInfo.format ?? 'Unknown'}</p>
        <p>Resolution: {imageInfo.width ?? '—'} x {imageInfo.height ?? '—'}</p>
        <p>Mode: {imageInfo.mode ?? '—'}</p>
      </div>

      <div className="metadata-section">
        <h3 className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-violet-400" /> File Info</h3>
        <p>Size: {fileInfo.size_kb ?? '—'} KB</p>
        <p>Created: {fileInfo.created ?? '—'}</p>
        <p>Modified: {fileInfo.modified ?? '—'}</p>
      </div>

      <div className="metadata-section">
        <h3 className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-violet-400" /> Analysis</h3>
        {analysisItems && analysisItems.length > 0 ? (
          analysisItems.map((item, index) => (
            <p key={`analysis-${index}`}>• {item}</p>
          ))
        ) : (
          <p>No metadata anomalies detected</p>
        )}
      </div>
    </div>
  )
}

function ForensicImage({ title, description, icon: Icon, src }) {
  return (
    <div className="glass-sm rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-violet-400" />
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <img
        src={src}
        alt={title}
        className="w-full h-auto rounded-lg border border-white/10 object-cover shadow-lg shadow-purple-500/10"
      />
    </div>
  )
}
