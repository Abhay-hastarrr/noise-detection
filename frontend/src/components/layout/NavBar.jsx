import { NavLink } from 'react-router-dom'
import { Shield, Moon, Sun, Home, Clock } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const navLinks = [
  { label: 'Home', to: '/', exact: true, icon: Home },
  { label: 'History', to: '/history', icon: Clock },
]

function NavBar() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span 
                className="text-2xl font-black bg-clip-text text-transparent"
                style={{
                  backgroundImage: document.documentElement.getAttribute('data-theme') === 'light'
                    ? 'linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)'
                    : 'linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)'
                }}
              >
                Noise Ninja
              </span>
            </NavLink>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? isDark 
                          ? 'gradient-primary text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50'
                    }`
                  }
                >
                  <IconComponent className="w-4 h-4" />
                  {link.label}
                </NavLink>
              )
            })}
          </div>

          {/* Theme Toggle - Right */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                border: '1px solid ' + (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.15)'),
              }}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4 justify-center">
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.exact}
                    className={({ isActive }) =>
                      `p-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? isDark
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                          : isDark
                            ? 'text-gray-400 hover:text-white hover:bg-white/10'
                            : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50'
                      }`
                    }
                    title={link.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
