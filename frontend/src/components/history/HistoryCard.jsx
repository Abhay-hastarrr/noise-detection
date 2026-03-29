import { useNavigate } from 'react-router-dom'
import Card from '../common/Card'
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

function HistoryCard({ item }) {
  const navigate = useNavigate()
  const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : '—'
  
  const isPredictedTampered = item.predicted_result === true
  const isPredictedClean = item.predicted_result === false
  const confidence = item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : '—'

  const resultBadge = isPredictedTampered ? (
    <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Tampered</span>
  ) : isPredictedClean ? (
    <span className="badge-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Clean</span>
  ) : (
    <span className="text-gray-400">Unknown</span>
  )

  const handleCardClick = () => {
    navigate(`/history/${item.id}`)
  }

  return (
    <Card 
      className="p-0 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/15 transition-all duration-300 cursor-pointer" 
      variant="default"
      onClick={handleCardClick}
    >
      {/* Image */}
      {item.original_image && (
        <div className="relative overflow-hidden h-48 bg-gradient-to-br from-slate-800 to-slate-900">
          <img
            src={item.original_image}
            alt={`Analysis ${item.id}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-xs text-gray-300 font-medium">Click to view details</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Result Badge */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Detection Result</p>
            {resultBadge}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Overall Confidence */}
          <div className="glass-sm rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-400">Confidence</p>
            <p className="text-lg font-bold text-gradient-accent">
              {confidence}
            </p>
          </div>

          {/* Noise Confidence */}
          {item.noise_confidence !== undefined && (
            <div className="glass-sm rounded-lg p-3 space-y-1">
              <p className="text-xs text-gray-400">Noise</p>
              <p className="text-lg font-bold text-indigo-400">
                {typeof item.noise_confidence === 'number' ? `${(item.noise_confidence * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          )}

          {/* Clone Confidence */}
          {item.clone_confidence !== undefined && (
            <div className="glass-sm rounded-lg p-3 space-y-1">
              <p className="text-xs text-gray-400">Clone</p>
              <p className="text-lg font-bold text-pink-400">
                {typeof item.clone_confidence === 'number' ? `${(item.clone_confidence * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          )}

          {/* Metadata Confidence */}
          {item.metadata_confidence !== undefined && (
            <div className="glass-sm rounded-lg p-3 space-y-1">
              <p className="text-xs text-gray-400">Metadata</p>
              <p className="text-lg font-bold text-blue-400">
                {typeof item.metadata_confidence === 'number' ? `${(item.metadata_confidence * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {createdAt}</p>
        </div>
      </div>
    </Card>
  )
}

export default HistoryCard
