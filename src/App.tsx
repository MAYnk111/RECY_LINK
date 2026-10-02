import React, { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { Navigation } from './components/Navigation'
import { ScrollScene } from './components/ScrollScene'
import { ProductFlow } from './components/ProductFlow'

export default function App() {
  const [showProductFlow, setShowProductFlow] = useState(false)
  const [defaultRole, setDefaultRole] = useState<'household' | 'collector' | 'company' | 'recycler' | null>(null)
  const [initialCategory, setInitialCategory] = useState<string | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  // Initialize smooth scrolling with Lenis on canvas
  useEffect(() => {
    if (showProductFlow) {
      lenisRef.current?.destroy()
      lenisRef.current = null
      return
    }

    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      lenisRef.current = lenis

      const raf = (time: number) => {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)

      return () => {
        lenis.destroy()
        lenisRef.current = null
      }
    } catch {
      // Fallback to native smooth scroll
    }
  }, [showProductFlow])

  const handleStartFlow = (role: 'household' | 'collector' | 'company' | 'recycler' = 'household', category?: string) => {
    setDefaultRole(role)
    setInitialCategory(category || null)
    setShowProductFlow(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleCloseFlow = () => {
    setShowProductFlow(false)
    setDefaultRole(null)
    setInitialCategory(null)
  }

  const handleExplore = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: (10 / 100) * maxScroll, behavior: 'smooth' })
  }

  const handleNavigateToScene = (pct: number) => {
    if (showProductFlow) {
      setShowProductFlow(false)
      setTimeout(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo({ top: (pct / 100) * maxScroll, behavior: 'smooth' })
      }, 50)
    } else {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: (pct / 100) * maxScroll, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* Fixed top navigation */}
      {!showProductFlow && (
        <Navigation
          onStartFlow={() => handleStartFlow('household')}
          onNavigateToScene={handleNavigateToScene}
        />
      )}

      {/* Main scroll-driven cinematic experience */}
      {!showProductFlow && (
        <ScrollScene
          onStartFlow={() => handleStartFlow('household')}
          onExplore={handleExplore}
          onSelectCategory={(cat) => handleStartFlow('household', cat)}
        />
      )}

      {/* Persistent Floating Action Button (bottom-right) */}
      {!showProductFlow && (
        <button
          className="fab"
          onClick={() => handleStartFlow('household')}
          title="Start with your waste"
        >
          <span className="fab-dot" />
          START RECYCLING
        </button>
      )}

      {/* Full-document Scrollable Interactive Product Flow */}
      {showProductFlow && (
        <ProductFlow
          onClose={handleCloseFlow}
          defaultRole={defaultRole}
          initialCategory={initialCategory}
        />
      )}
    </div>
  )
}
