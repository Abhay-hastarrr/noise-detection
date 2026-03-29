import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import History from './pages/History'
import ImageDetail from './pages/ImageDetail'

function App() {
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
        theme="dark"
        style={{
          '--toastify-color-light': 'rgba(15, 23, 42, 0.95)',
          '--toastify-color-dark': 'rgba(15, 23, 42, 0.95)',
          '--toastify-color-info': '#7c3aed',
          '--toastify-color-success': '#10b981',
          '--toastify-color-warning': '#f59e0b',
          '--toastify-color-error': '#ef4444',
          '--toastify-text-color-light': '#f1f5f9',
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
