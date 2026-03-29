import Card from '../components/common/Card'
import HistoryGrid from '../components/history/HistoryGrid'
import useAnalysisHistory from '../hooks/useAnalysisHistory'
import { History as HistoryIcon, AlertTriangle, FolderOpen } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function History() {
  const { isDark } = useTheme()
  const { history, loading, error } = useAnalysisHistory()
  const hasItems = !loading && !error && history.length > 0
  const isEmpty = !loading && !error && history.length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500">
            <HistoryIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-gradient">Analysis History</h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Review all your previously analyzed images and detection results
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-16 text-center glass" variant="elevated">
          <div className="inline-block mb-4">
            <div 
              className="h-12 w-12 animate-spin rounded-full border-4 border-t-indigo-500" 
              style={{
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                borderTopColor: '#4f46e5'
              }}
            ></div>
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading your analysis history...</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card 
          className="p-8 glass" 
          variant="default"
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.08)',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.2)'
          }}
        >
          <div className="space-y-2">
            <p 
              className="text-lg font-semibold flex items-center gap-2" 
              style={{ color: isDark ? '#fca5a5' : '#991b1b' }}
            >
              <AlertTriangle className="w-5 h-5" /> Error Loading History
            </p>
            <p style={{ color: isDark ? '#fecaca' : '#b91c1c' }}>{error}</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {isEmpty && (
        <Card className="p-16 text-center glass" variant="default">
          <div className="space-y-3">
            <FolderOpen className="w-12 h-12 mx-auto" style={{ color: isDark ? '#64748b' : '#cbd5e1' }} />
            <p className="text-lg" style={{ color: isDark ? '#a1a5b8' : '#94a3b8' }}>No analysis history yet</p>
            <p style={{ color: isDark ? '#8b92ad' : '#cbd5e1' }}>Analyze images to build your history</p>
          </div>
        </Card>
      )}

      {/* History Grid */}
      {hasItems && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-6 h-6" style={{ color: isDark ? '#a78bfa' : '#4f46e5' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{history.length} Analysis Results</h2>
          </div>
          <HistoryGrid items={history} />
        </div>
      )}
    </div>
  )
}

export default History
