import Card from '../common/Card'
import { Upload, CheckCircle2, AlertCircle, Loader2, ImagePlus } from 'lucide-react'

function UploadForm({
  fileName,
  simulateTamper,
  loading,
  error,
  onFileChange,
  onSimulateChange,
  onSubmit,
}) {
  return (
    <Card className="p-10 space-y-8" variant="elevated">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImagePlus className="w-6 h-6 text-indigo-400" />
            Upload Image
          </h3>
          <p className="text-sm text-gray-400">Choose an image to analyze for tampering</p>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-white/90">Select Image File</label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />
            <div className={`input-modern cursor-pointer flex items-center justify-center gap-3 hover:bg-white/20 py-8 text-center transition-all ${
              fileName ? 'bg-white/10 border-indigo-500/50' : ''
            }`}>
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white">
                    {fileName ? `Selected: ${fileName}` : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
          {fileName && (
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="w-4 h-4" />
              <p className="text-xs font-medium">File ready for analysis</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Simulate Tampering Checkbox */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-white/90">Analysis Options</label>
          <div className="glass-sm rounded-lg p-5 space-y-3 hover:bg-white/5 transition-all">
            <label className="inline-flex items-center gap-3 cursor-pointer group w-full">
              <input
                type="checkbox"
                checked={simulateTamper}
                onChange={(event) => onSimulateChange(event.target.checked)}
                disabled={loading}
                className="h-5 w-5 rounded border border-white/20 bg-white/10 checked:bg-gradient-to-r checked:from-indigo-600 checked:to-indigo-500 cursor-pointer transition-all accent-indigo-600"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-white/80 group-hover:text-white/90 transition-colors block">
                  Simulate tampering for testing
                </span>
                <p className="text-xs text-gray-500 mt-1">Add synthetic artifacts to test detection accuracy</p>
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2 animate-in">
            <p className="text-sm font-medium text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> 
              Error
            </p>
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !fileName}
          className="w-full py-4 rounded-lg font-bold transition-all duration-300 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Image...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" /> 
              Analyze Image
            </span>
          )}
        </button>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          Your image is analyzed securely and not stored after processing
        </p>
      </form>
    </Card>
  )
}

export default UploadForm
