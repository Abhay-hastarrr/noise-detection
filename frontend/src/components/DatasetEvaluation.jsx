import Card from './common/Card'
import useDatasetEvaluation from '../hooks/useDatasetEvaluation'
import { Activity, AlertCircle, BarChart3, Target } from 'lucide-react'

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function DatasetEvaluation() {
  const { metrics, loading, error } = useDatasetEvaluation()
  const hasData = !loading && !error && !!metrics

  const formatPercent = (value) => `${(Number(value) * 100).toFixed(1)}%`
  const runLabel = metrics?.label?.trim() || 'Unnamed Dataset'
  const runDate = metrics ? new Date(metrics.created_at).toLocaleString() : null

  return (
    <Card className="p-8 space-y-6" variant="elevated">
      <div className="space-y-1">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Activity className="w-5 h-5 text-emerald-500" /> Offline Benchmark
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Latest dataset evaluation run
        </p>
      </div>

      {loading && (
        <div className="py-4 space-y-2 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 mx-auto" style={{
            borderColor: 'var(--border-color)',
            borderTopColor: '#10b981'
          }}></div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading benchmark...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <p className="text-sm flex items-center gap-2" style={{ color: '#ef4444' }}>
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="text-center space-y-2">
          <Target className="w-10 h-10 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Run the dataset evaluator to capture offline accuracy metrics.
          </p>
        </div>
      )}

      {hasData && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <div className="text-4xl font-black text-gradient-accent">
              {formatPercent(metrics.accuracy)}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Offline Accuracy</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {runLabel} • {runDate}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricRow label="Precision" value={formatPercent(metrics.precision)} />
            <MetricRow label="Recall" value={formatPercent(metrics.recall)} />
            <MetricRow label="F1 Score" value={formatPercent(metrics.f1)} />
            <MetricRow label="Samples" value={metrics.total_samples} />
          </div>

          <div className="rounded-lg p-4" style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#10b981' }}>
              <BarChart3 className="w-4 h-4" /> Confusion Breakdown
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div>TP: {metrics.true_positive}</div>
              <div>TN: {metrics.true_negative}</div>
              <div>FP: {metrics.false_positive}</div>
              <div>FN: {metrics.false_negative}</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default DatasetEvaluation
