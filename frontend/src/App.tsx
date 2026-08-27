import { useEffect, useState } from 'react'
import { Calculator } from './components/Calculator'
import { ThemeToggle } from './components/ThemeToggle'
import { getSystemTheme } from './theme'
import './App.css'

function App() {
  // Initial state follows the OS preference; from then on it's a plain
  // manual toggle (it doesn't keep tracking OS changes once touched).
  const [theme, setTheme] = useState(getSystemTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <main className="app">
      <div className="app-header">
        <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      </div>
      <Calculator />
    </main>
  )
}

export default App
