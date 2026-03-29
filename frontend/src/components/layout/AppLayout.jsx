import NavBar from './NavBar'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
