import Card from '../components/common/Card'
import HistoryGrid from '../components/history/HistoryGrid'
import useAnalysisHistory from '../hooks/useAnalysisHistory'
import { History as HistoryIcon, AlertTriangle, FolderOpen } from 'lucide-react'

function History() {
  const { history, loading, error } = useAnalysisHistory()
  const hasItems = !loading && !error && history.length > 0
  const isEmpty = !loading && !error && history.length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600">
            <HistoryIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-gradient">Analysis History</h1>
        <p className="text-lg text-gray-300">
          Review all your previously analyzed images and detection results
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-16 text-center glass" variant="elevated">
          <div className="inline-block mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-purple-500"></div>
          </div>
          <p className="text-lg font-semibold text-gray-300">Loading your analysis history...</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8 glass bg-red-500/10 border-red-500/30" variant="default">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-red-300 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Error Loading History</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {isEmpty && (
        <Card className="p-16 text-center glass" variant="default">
          <div className="space-y-3">
            <FolderOpen className="w-12 h-12 text-gray-500 mx-auto" />
            <p className="text-gray-400 text-lg">No analysis history yet</p>
            <p className="text-gray-500 text-sm">Analyze images to build your history</p>
          </div>
        </Card>
      )}

      {/* History Grid */}
      {hasItems && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-bold text-white">{history.length} Analysis Results</h2>
          </div>
          <HistoryGrid items={history} />
        </div>
      )}
    </div>
  )
}

export default History
