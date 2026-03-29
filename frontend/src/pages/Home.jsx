import Accuracy from '../components/Accuracy'
import AnalysisResult from '../components/home/AnalysisResult'
import UploadForm from '../components/home/UploadForm'
import useUploadAnalysis from '../hooks/useUploadAnalysis'
import { Zap, Shield, Brain, Zap as FastIcon } from 'lucide-react'

function Home() {
  const {
    file,
    simulateTamper,
    result,
    loading,
    error,
    handleFileChange,
    handleSimulateChange,
    submitAnalysis,
  } = useUploadAnalysis()

  const handleSubmit = async (event) => {
    event.preventDefault()
    await submitAnalysis()
  }

  const features = [
    {
      icon: Shield,
      title: 'Advanced Detection',
      description: 'AI-powered analysis for tampering artifacts'
    },
    {
      icon: Brain,
      title: 'Deep Learning',
      description: 'Neural networks trained on thousands of images'
    },
    {
      icon: FastIcon,
      title: 'Instant Results',
      description: 'Get results in seconds with high accuracy'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          display: document.documentElement.getAttribute('data-theme') === 'light' ? 'block' : 'block'
        }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl" style={{
            backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.2)'
          }}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl" style={{
            backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(71, 85, 105, 0.2)'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center gap-3 mb-4 px-4 py-2 rounded-full" style={{
            backgroundColor: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)'
          }}>
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-light)' }}>AI-Powered Detection</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gradient leading-tight">
            Detect Image Tampering With AI
          </h1>
          
          <p className="text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Advanced image analysis to detect synthetic artifacts, cloning, noise, and digital manipulation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!result && !loading ? (
          <div className="space-y-12">
            {/* Upload Section */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left - Features */}
              <div className="space-y-6 order-2 lg:order-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Why Choose Noise Ninja?</h2>
                
                {features.map((feature, idx) => {
                  const Icon = feature.icon
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-tertiary)' }}>{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right - Upload Form */}
              <div className="order-1 lg:order-2">
                <UploadForm
                  fileName={file?.name}
                  simulateTamper={simulateTamper}
                  loading={loading}
                  error={error}
                  onFileChange={handleFileChange}
                  onSimulateChange={handleSimulateChange}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            {/* Accuracy Stats Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-2xl font-bold text-white mb-8">Our Performance</h3>
              <Accuracy />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Back to Upload Option */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Analysis Results</h2>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-lg font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                Analyze Another Image
              </button>
            </div>

            {loading ? (
              <div className="card-premium glass text-center py-24 space-y-4">
                <div className="inline-block">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-purple-500 mx-auto"></div>
                </div>
                <p className="text-2xl font-bold text-white">Analyzing image...</p>
                <p className="text-gray-400">Running advanced AI detection algorithms</p>
              </div>
            ) : result ? (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <AnalysisResult result={result} />
                </div>
                <div className="space-y-8">
                  <Accuracy />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
