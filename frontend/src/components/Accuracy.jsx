import Card from './common/Card'
import useAccuracyStats from '../hooks/useAccuracyStats'
import { BarChart3, AlertCircle, FolderOpen, CheckCircle2 } from 'lucide-react'

function Accuracy() {
    const { stats, loading, error } = useAccuracyStats()
    const hasData = !loading && !error && stats && stats.total > 0
    const isEmpty = !loading && !error && stats && stats.total === 0
    const accuracy = stats ? Number(stats.accuracy ?? 0).toFixed(1) : 0

    return (
        <Card className="p-8 space-y-6 text-center" variant="elevated">
            <div className="space-y-2">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  <BarChart3 className="w-5 h-5 text-indigo-500 inline mr-2" /> Model Accuracy
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Average detection accuracy</p>
            </div>

            {loading && (
                <div className="py-4 space-y-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 mx-auto" style={{
                      borderColor: 'var(--border-color)',
                      borderTopColor: '#6366f1'
                    }}></div>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading accuracy...</p>
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

            {isEmpty && (
                <div className="py-4 space-y-2">
                    <FolderOpen className="w-8 h-8 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No data available</p>
                </div>
            )}

            {hasData && (
                <div className="space-y-4">
                    {/* Large Accuracy Display */}
                    <div className="space-y-2">
                        <div className="text-5xl font-black text-gradient-accent">
                            {accuracy}%
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Overall Accuracy</p>
                    </div>

                    {/* Stats */}
                    <div className="glass-sm rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Correct Predictions</span>
                            <span className="text-lg font-bold flex items-center gap-1" style={{ color: '#10b981' }}>
                              <CheckCircle2 className="w-4 h-4" /> {stats.correct}
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-right" style={{ color: 'var(--text-tertiary)' }}>{stats.correct} of {stats.total}</p>
                    </div>
                </div>
            )}
        </Card>
    )
}

export default Accuracy
