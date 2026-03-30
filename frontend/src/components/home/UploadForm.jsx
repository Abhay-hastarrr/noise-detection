import Card from '../common/Card'
import { Upload, AlertCircle, Loader2, ImagePlus, Wand2, Image, Sparkles } from 'lucide-react'
import { useState } from 'react'

function UploadForm({
  fileName,
  simulateTamper,
  loading,
  error,
  onFileChange,
  onSimulateChange,
  onSubmit,
}) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type !== 'dragleave')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      onFileChange(e.dataTransfer.files[0])
    }
  }

  return (
    <Card className="p-0 overflow-hidden relative" variant="elevated">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-600/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <form onSubmit={onSubmit} className="relative z-10 flex flex-col">
        {/* Top Header Section */}
        <div className="px-6 lg:px-10 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-lg opacity-75"></div>
              <div className="relative p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/50">
                <ImagePlus className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Image Analyzer
            </h3>
          </div>

          {/* Mode Toggle - Right Side */}
          <div className="relative bg-gradient-to-r from-white/10 to-white/5 rounded-full p-1 flex gap-1 shadow-lg shadow-indigo-500/5 border border-white/10 backdrop-blur-md">
            {/* Animated Background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-gradient-to-r rounded-full transition-all duration-500 shadow-lg backdrop-blur-sm ${
                simulateTamper
                  ? 'from-amber-500/80 to-orange-500/80 right-1'
                  : 'from-indigo-500/80 to-purple-500/80 left-1'
              }`}
            />
            
            {/* Normal Mode */}
            <button
              type="button"
              onClick={() => onSimulateChange(false)}
              disabled={loading}
              className={`relative py-2 px-3 rounded-full font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                !simulateTamper
                  ? 'text-white z-10 drop-shadow'
                  : 'text-gray-400 hover:text-white/80'
              }`}
            >
              <Image className="w-3 h-3" />
              <span className="hidden sm:inline">Normal</span>
            </button>
            
            {/* Simulate Mode */}
            <button
              type="button"
              onClick={() => onSimulateChange(true)}
              disabled={loading}
              className={`relative py-2 px-3 rounded-full font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                simulateTamper
                  ? 'text-white z-10 drop-shadow'
                  : 'text-gray-400 hover:text-white/80'
              }`}
            >
              <Wand2 className="w-3 h-3" />
              <span className="hidden sm:inline">Simulate</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Upload Section */}
          <div className="p-6 lg:p-8 flex flex-col justify-center border-b border-white/10">
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="relative group"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={loading}
                />
                
                <div
                  className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 p-6 text-center backdrop-blur-sm ${
                    dragActive
                      ? 'border-indigo-400 bg-indigo-500/15 scale-105 shadow-2xl shadow-indigo-500/30'
                      : fileName
                      ? 'border-indigo-500/60 bg-indigo-500/10 shadow-xl shadow-indigo-500/10'
                      : 'border-dashed border-white/30 bg-white/8 hover:border-indigo-400 hover:bg-indigo-500/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {fileName ? (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-xl opacity-80 animate-pulse"></div>
                          <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/50 scale-100">
                            <Image className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white text-sm truncate max-w-xs">{fileName}</p>
                          <p className="text-xs bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent font-semibold">✨ Ready</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-lg blur-lg opacity-0 group-hover/icon:opacity-100 transition-opacity animate-pulse"></div>
                          <div className="relative p-2 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-md group-hover/icon:from-indigo-500/50 group-hover/icon:to-purple-500/50 transition-all group-hover/icon:scale-110">
                            <Upload className="w-5 h-5 text-indigo-300" />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white text-sm">Drop here or click</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF • Max 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/50 rounded-lg p-3 space-y-1 backdrop-blur-md animate-in">
                  <p className="text-xs font-bold text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </p>
                  <p className="text-xs text-red-200">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="w-full p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-b from-white/8 via-white/5 to-transparent">
            <div className="space-y-2">
              {/* Mode Info */}
              <div className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-3 space-y-1 backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  {simulateTamper ? '✨ Simulate' : '🔍 Normal'}
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {simulateTamper
                    ? 'Test with synthetic artifacts'
                    : 'Real-time tampering detection'
                  }
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-2 mt-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition-opacity duration-300 animate-pulse"></div>
                <button
                  type="submit"
                  disabled={loading || !fileName}
                  className="relative w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  )
}

export default UploadForm
