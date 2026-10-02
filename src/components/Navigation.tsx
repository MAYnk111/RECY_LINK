import React, { useEffect, useState } from 'react'

interface NavigationProps {
  onStartFlow: () => void
  onNavigateToScene?: (pct: number) => void
}

export function Navigation({ onStartFlow, onNavigateToScene }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (pct: number) => {
    if (onNavigateToScene) {
      onNavigateToScene(pct)
    } else {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: (pct / 100) * maxScroll, behavior: 'smooth' })
    }
  }

  return (
    <nav className={`nav-fixed ${scrolled ? 'scrolled' : ''}`}>
      {/* Brand */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'none',
          textAlign: 'left',
          padding: 0,
        }}
      >
        <span className="f-display" style={{ fontSize: '1.25rem', letterSpacing: '.12em', color: 'var(--text)' }}>
          RECY-LINK
        </span>
      </button>

      {/* Center Nav */}
      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => handleNavClick(44)}
          className="f-label"
          style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text)' }}
        >
          HOW IT WORKS
        </button>
        <button
          onClick={() => handleNavClick(74)}
          className="f-label"
          style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text)' }}
        >
          MATERIAL PASSPORT
        </button>
        <button
          onClick={() => handleNavClick(64)}
          className="f-label"
          style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text)' }}
        >
          COLLECTORS
        </button>
        <button
          onClick={() => handleNavClick(88)}
          className="f-label"
          style={{ background: 'none', border: 'none', cursor: 'none', color: 'var(--text)' }}
        >
          MATERIALS
        </button>
      </div>

      {/* Right Primary CTA */}
      <div className="flex items-center gap-4">
        <button
          className="btn btn-dark"
          style={{ padding: '.65rem 1.4rem', fontSize: '.58rem' }}
          onClick={onStartFlow}
        >
          START RECYCLING
        </button>
      </div>
    </nav>
  )
}
