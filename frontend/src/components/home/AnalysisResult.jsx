import Card from '../common/Card'
import { Target, BarChart3, FileText, Image, CheckCircle2, AlertTriangle, Search, Camera, HardDrive, AlertCircle, Flame, Radar, ChevronDown } from 'lucide-react'
import { useState } from 'react'

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
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState({})

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'forensics', label: 'Forensics', icon: Image },
    { id: 'metadata', label: 'Metadata', icon: Search },
  ]

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="space-y-6">
      {/* Premium Tab Navigation */}
      <Card className="p-2" variant="elevated">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all duration-300 text-sm font-medium ${
                activeTab === id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card className="p-8 space-y-6" variant="elevated">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gradient">Analysis Result</h2>
              </div>
            </div>

            {/* Result Status - Large Display */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Predicted Result */}
                <div className="glass-sm rounded-xl p-6 space-y-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Detection Result</p>
                  <div className="text-2xl font-bold">
                    {getPredictedBadge(result.predicted_result)}
                  </div>
                </div>

                {/* Confidence Gauge */}
                <div className="glass-sm rounded-xl p-6 space-y-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Confidence Score</p>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gradient-accent">{confidence}</div>
                    <div className="w-full bg-white/5 rounded-full h-2 border border-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-slate-400 to-slate-500"
                        style={{ width: `${(parseFloat(confidence) || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {result.decision_reason && (
                <div className="glass-sm rounded-xl p-6 space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Decision Rationale</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.decision_reason}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Insights */}
          {result.metadata_details && (
            <Card className="p-6 space-y-4" variant="elevated">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Key Findings</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.metadata_details}</p>
            </Card>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <Card className="p-8 space-y-6" variant="elevated">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Confidence Breakdown</h3>
            </div>
            <p className="text-sm text-gray-400">Individual analysis metrics with visual indicators</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metricConfig.map(({ key, label }) => {
              if (key === 'predicted_result') return null
              const value = result[key]
              const numValue = typeof value === 'number' ? value : 0
              const percentage = (numValue * 100).toFixed(1)
              
              return (
                <div key={key} className="glass-sm rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-300">{label}</p>
                    <p className="text-lg font-bold text-gradient-accent">{percentage}%</p>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 border border-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Forensics Tab */}
      {activeTab === 'forensics' && forensicVisuals.length > 0 && (
        <Card className="p-8 space-y-6" variant="elevated">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
                <Image className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Forensic Analysis</h3>
            </div>
            <p className="text-sm text-gray-400">Visual artifacts and detection overlays</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
            {forensicVisuals.map(({ id, ...visual }) => (
              <ForensicImage key={id} {...visual} />
            ))}
          </div>
        </Card>
      )}

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <MetadataPanel metadata={metadataPayload} expandedSections={expandedSections} toggleSection={toggleSection} />
      )}
    </div>
  )
}

export default AnalysisResult

function MetadataPanel({ metadata, expandedSections, toggleSection }) {
  if (!metadata) return null

  const exifEntries = metadata.exif ?? {}
  const imageInfo = metadata.image_info ?? {}
  const fileInfo = metadata.file_info ?? {}
  const analysisItems = metadata.analysis ?? []

  const sections = [
    {
      id: 'exif',
      title: 'EXIF Metadata',
      icon: Camera,
      content: Object.keys(exifEntries).length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)' }}>No EXIF metadata found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(exifEntries).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span style={{ color: 'var(--text-tertiary)' }}>{key}:</span>
              <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{String(value)}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'image',
      title: 'Image Information',
      icon: Image,
      content: (
        <div className="space-y-2">
          <div className="text-sm"><span style={{ color: 'var(--text-tertiary)' }}>Format:</span> <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{imageInfo.format ?? 'Unknown'}</span></div>
          <div className="text-sm"><span style={{ color: 'var(--text-tertiary)' }}>Resolution:</span> <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{imageInfo.width ?? '—'} × {imageInfo.height ?? '—'}</span></div>
          <div className="text-sm"><span style={{ color: 'var(--text-tertiary)' }}>Mode:</span> <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{imageInfo.mode ?? '—'}</span></div>
        </div>
      ),
    },
    {
      id: 'file',
      title: 'File Information',
      icon: HardDrive,
      content: (
        <div className="space-y-2">
          <div className="text-sm"><span style={{ color: 'var(--text-tertiary)' }}>Size:</span> <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{fileInfo.size_kb ?? '—'} KB</span></div>
          <div className="text-sm"><span style={{ color: 'var(--text-tertiary)' }}>Created:</span> <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{fileInfo.created ?? '—'}</span></div>
          <div className="text-sm"><span style={{ color: 'var(--text-tertiary)' }}>Modified:</span> <span className="ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{fileInfo.modified ?? '—'}</span></div>
        </div>
      ),
    },
    {
      id: 'analysis',
      title: 'Analysis Findings',
      icon: AlertCircle,
      content: analysisItems && analysisItems.length > 0 ? (
        <ul className="space-y-1">
          {analysisItems.map((item, index) => (
            <li key={`analysis-${index}`} className="text-sm" style={{ color: 'var(--text-secondary)' }}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No metadata anomalies detected</p>
      ),
    },
  ]

  return (
    <Card className="p-6 space-y-4" variant="elevated">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
            <Search className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Metadata Details</h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>File metadata and forensic analysis</p>
      </div>

      <div className="space-y-3">
        {sections.map(({ id, title, icon: Icon, content }) => (
          <div
            key={id}
            className="rounded-lg overflow-hidden transition-all"
            style={{ border: `1px solid var(--border-color)` }}
          >
            <button
              onClick={() => toggleSection(id)}
              className="w-full px-5 py-4 flex items-center justify-between transition-colors"
              style={{
                backgroundColor: expandedSections[id]
                  ? 'var(--glass-bg)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-indigo-400" />
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </p>
              </div>
              <ChevronDown
                className="w-5 h-5 transition-transform duration-300"
                style={{
                  color: 'var(--text-tertiary)',
                  transform: expandedSections[id]
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                }}
              />
            </button>
            {expandedSections[id] && (
              <div
                className="px-5 py-4 border-t space-y-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {content}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
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
