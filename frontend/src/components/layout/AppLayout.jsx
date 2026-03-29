import NavBar from './NavBar'
import { useTheme } from '../../context/ThemeContext'

function AppLayout({ children }) {
  const { isDark } = useTheme()

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={isDark ? {
        background: 'linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #0f172a 100%)'
      } : {
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)'
      }}
    >
      <NavBar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AppLayout
