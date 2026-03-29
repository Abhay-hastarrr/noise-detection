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
                <h2 className="text-lg font-bold text-white flex items-center gap-2 justify-center"><BarChart3 className="w-5 h-5 text-violet-400" /> Model Accuracy</h2>
                <p className="text-xs text-gray-400">Average detection accuracy</p>
            </div>

            {loading && (
                <div className="py-4 space-y-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-violet-500 mx-auto"></div>
                    <p className="text-sm text-gray-400">Loading accuracy...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-300 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>
                </div>
            )}

            {isEmpty && (
                <div className="py-4 space-y-2">
                    <FolderOpen className="w-8 h-8 text-gray-500 mx-auto" />
                    <p className="text-sm text-gray-400">No data available</p>
                </div>
            )}

            {hasData && (
                <div className="space-y-4">
                    {/* Large Accuracy Display */}
                    <div className="space-y-2">
                        <div className="text-5xl font-black text-gradient-accent">
                            {accuracy}%
                        </div>
                        <p className="text-xs text-gray-400">Overall Accuracy</p>
                    </div>

                    {/* Stats */}
                    <div className="glass-sm rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-xs text-gray-400">Correct Predictions</span>
                            <span className="text-lg font-bold text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {stats.correct}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">{stats.correct} of {stats.total}</p>
                    </div>
                </div>
            )}
        </Card>
    )
}

export default Accuracy
