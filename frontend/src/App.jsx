import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import History from './pages/History'
import ImageDetail from './pages/ImageDetail'

function App() {
  const { isDark } = useTheme()

  return (
    <AppLayout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
        style={{
          '--toastify-color-light': isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          '--toastify-color-dark': isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
          '--toastify-color-info': '#4f46e5',
          '--toastify-color-success': '#10b981',
          '--toastify-color-warning': '#f59e0b',
          '--toastify-color-error': '#ef4444',
          '--toastify-text-color-light': isDark ? '#f1f5f9' : '#0f172a',
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<ImageDetail />} />
      </Routes>
    </AppLayout>
  )
}

export default App
