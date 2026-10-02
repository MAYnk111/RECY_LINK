/**
 * ScrollScene — Continuous Cinematic Editorial Canvas
 * 
 * Choreographed scroll journey where the PET bottle is the central physical protagonist.
 * 
 * Major Highlight (Reference Frame 05 pattern):
 * The hero PET bottle travels through the cinematic narrative, scales down,
 * rotates upright, and physically LANDS into the PET slot of a horizontal
 * editorial Material Gallery alongside E-Waste, Hazardous, Paper, Metal, and Glass.
 */
import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PETBottle } from './PETBottle'
import {
  EWasteDevice,
  HazardousBattery,
  CardboardPackage,
  AluminiumCan,
  GlassBottle,
} from './MaterialObjects'
import { useStore } from '../store'

gsap.registerPlugin(ScrollTrigger)

interface Keyframe {
  p: number     // Scroll percentage (0-100)
  x: number     // X offset in vw (relative to center)
  y: number     // Y offset in vh (relative to center)
  r: number     // Rotation in degrees
  s: number     // Scale multiplier
  tilt: number  // 3D perspective tilt in degrees
}

// ── Continuous Keyframe Map ──────────────────────────────────────────────
const KEYFRAMES: Keyframe[] = [
  // 00%: Opening — Large, isolated, diagonal right
  { p: 0,   x: 24,  y: -2,   r: -24, s: 1.4,  tilt: 12 },
  // 08%: Floating / Drift begins
  { p: 8,   x: 18,  y: 6,    r: -16, s: 1.25, tilt: 8  },
  // 16%: "BUT WHERE DOES IT GO?" — Moving downward left
  { p: 16,  x: 4,   y: 14,   r: -8,  s: 1.1,  tilt: -4 },
  // 24%: Approaching dustbin on left
  { p: 24,  x: -18, y: 22,   r: 12,  s: 0.95, tilt: -12 },
  // 30%: Peak dustbin encounter — hovering directly above bin mouth
  { p: 30,  x: -22, y: 24,   r: 22,  s: 0.88, tilt: -16 },
  // 36%: "WHAT IF IT DIDN'T END THERE?" — System intervention: sudden arrest and reverse upward
  { p: 36,  x: -2,  y: 8,    r: -5,  s: 1.15, tilt: 5  },
  // 44%: "EVERY BOTTLE HAS A JOURNEY" — Bottle rises to prominent center-right
  { p: 44,  x: 26,  y: -6,   r: 14,  s: 1.35, tilt: 10 },
  // 54%: AI Identification — Bottle shifts to right side, allows scan matrix on left
  { p: 54,  x: 32,  y: -4,   r: 6,   s: 1.15, tilt: 4  },
  // 64%: Collector Matching — Bottle moves to lower right
  { p: 64,  x: 28,  y: 10,   r: -10, s: 1.0,  tilt: -6 },
  // 74%: Material Passport — Bottle anchors right side beside digital passport
  { p: 74,  x: 30,  y: -8,   r: 12,  s: 1.05, tilt: 8  },
  // 82%: Transition towards Material Gallery (starts scaling down & aligning upright)
  { p: 82,  x: 10,  y: 0,    r: 4,   s: 0.85, tilt: 3  },
  // 88%-94%: EXACT LANDING IN MATERIAL GALLERY (Reference 05)
  // X: -38vw (far left slot of the 6-item horizontal row), Y: -8vh, Scale: 0.52, Rotation: 0 deg upright
  { p: 88,  x: -38, y: -6,   r: 0,   s: 0.54, tilt: 0  },
  { p: 94,  x: -38, y: -6,   r: 0,   s: 0.54, tilt: 0  },
  // 100%: Finale — returns to center upright
  { p: 100, x: 0,   y: -4,   r: 0,   s: 1.45, tilt: 0  },
]

function interpolate(progress: number): Keyframe {
  const p = Math.max(0, Math.min(100, progress))
  let lo = KEYFRAMES[0]
  let hi = KEYFRAMES[KEYFRAMES.length - 1]
  
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i].p && p <= KEYFRAMES[i + 1].p) {
      lo = KEYFRAMES[i]
      hi = KEYFRAMES[i + 1]
      break
    }
  }
  
  const span = hi.p - lo.p
  const t = span === 0 ? 0 : (p - lo.p) / span
  // Smooth cubic ease-in-out
  const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  
  return {
    p,
    x: lo.x + (hi.x - lo.x) * ease,
    y: lo.y + (hi.y - lo.y) * ease,
    r: lo.r + (hi.r - lo.r) * ease,
    s: lo.s + (hi.s - lo.s) * ease,
    tilt: lo.tilt + (hi.tilt - lo.tilt) * ease,
  }
}

function calcOpacity(progress: number, start: number, peak: number, end: number): number {
  if (start === 0 && progress <= peak) return 1
  if (progress < start || progress > end) return 0
  if (progress <= peak) return Math.min(1, (progress - start) / Math.max(0.1, peak - start))
  return Math.max(0, 1 - (progress - peak) / Math.max(0.1, end - peak))
}

const STAGES = [
  { id: '01', name: 'DISCARDED', pct: 0 },
  { id: '02', name: 'DESCENT',   pct: 12 },
  { id: '03', name: 'DUSTBIN',   pct: 24 },
  { id: '04', name: 'RESCUE',    pct: 36 },
  { id: '05', name: 'JOURNEY',   pct: 44 },
  { id: '06', name: 'IDENTIFY',  pct: 54 },
  { id: '07', name: 'COLLECT',   pct: 64 },
  { id: '08', name: 'PASSPORT',  pct: 74 },
  { id: '09', name: 'MATERIALS', pct: 86 },
  { id: '10', name: 'REWARD',    pct: 95 },
]

export function ScrollScene({
  onStartFlow,
  onExplore,
  onSelectCategory,
}: {
  onStartFlow: () => void
  onExplore: () => void
  onSelectCategory?: (category: string) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeStageIdx, setActiveStageIdx] = useState(0)
  const [bottle, setBottle] = useState<Keyframe>(KEYFRAMES[0])
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    let lastScroll = -1
    const tick = () => {
      const el = scrollerRef.current
      if (el) {
        const top = window.scrollY
        if (top !== lastScroll) {
          lastScroll = top
          const max = el.offsetHeight - window.innerHeight
          const raw = max > 0 ? (top / max) * 100 : 0
          const p = Math.max(0, Math.min(100, raw))
          setProgress(p)
          setBottle(interpolate(p))
          
          let idx = 0
          for (let i = 0; i < STAGES.length; i++) {
            if (p >= STAGES[i].pct) idx = i
          }
          setActiveStageIdx(idx)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Scene Opacities
  const op01 = calcOpacity(progress, 0, 3, 9)
  const op02 = calcOpacity(progress, 8, 14, 21)
  const op03 = calcOpacity(progress, 20, 27, 33)
  const op04 = calcOpacity(progress, 32, 38, 43)
  const op05 = calcOpacity(progress, 42, 48, 53)
  const op06 = calcOpacity(progress, 52, 58, 63)
  const op07 = calcOpacity(progress, 62, 68, 73)
  const op08 = calcOpacity(progress, 72, 78, 83)
  // Material Gallery Opacity (Reference 05 peak window)
  const op09 = calcOpacity(progress, 84, 90, 95)
  // Finale Opacity
  const op10 = calcOpacity(progress, 94, 98, 100)

  const dustbinOpacity = calcOpacity(progress, 16, 28, 38)
  const isCrushed = progress >= 22 && progress <= 40

  const handleCategoryClick = (category: string) => {
    if (onSelectCategory) {
      onSelectCategory(category)
    } else {
      onStartFlow()
    }
  }

  return (
    <>
      {/* Tall container providing smooth 950vh scroll depth */}
      <div ref={scrollerRef} style={{ height: '950vh', pointerEvents: 'none' }} />

      {/* Pinned Fixed Canvas */}
      <div className="scroll-stage" style={{ background: 'var(--bg)' }}>

        {/* ── Background Editorial Typography Watermark ─────────────────── */}
        <div
          className="bg-word f-display"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${1 + progress * 0.003})`,
            fontSize: 'clamp(8rem, 26vw, 22rem)',
            color: 'rgba(23, 23, 23, 0.035)',
            letterSpacing: '-0.04em',
            zIndex: 2,
          }}
        >
          {progress < 36 ? 'DISCARD' : progress < 84 ? 'RECY-LINK' : 'CIRCULAR'}
        </div>

        {/* ── Dustbin Visual (Scene 03) ─────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '12vh',
            left: '6vw',
            opacity: dustbinOpacity,
            transform: `translateY(${(1 - dustbinOpacity) * 40}px)`,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="42" width="170" height="18" rx="4" fill="rgba(23, 23, 23, 0.75)" />
            <rect x="85" y="26" width="50" height="18" rx="3" fill="rgba(23, 23, 23, 0.65)" />
            <path
              d="M 36 60 L 24 235 Q 24 250 40 250 L 180 250 Q 196 250 196 235 L 184 60 Z"
              fill="rgba(23, 23, 23, 0.06)"
              stroke="rgba(23, 23, 23, 0.28)"
              strokeWidth="2.5"
            />
            {[65, 95, 125, 155].map((x) => (
              <line key={x} x1={x} y1="75" x2={x - 4} y2="235" stroke="rgba(23, 23, 23, 0.12)" strokeWidth="2" />
            ))}
            <text x="110" y="170" textAnchor="middle" fontSize="48" fill="rgba(23, 23, 23, 0.08)" fontFamily="sans-serif">
              🗑
            </text>
          </svg>
          <div className="f-label" style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.55rem' }}>
            LANDFILL / DUMP DESTINATION
          </div>
        </div>

        {/* ── ONE CONTINUOUS HERO PET BOTTLE ───────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            left: `calc(50% + ${bottle.x}vw)`,
            top: `calc(50% + ${bottle.y}vh)`,
            transform: `translate(-50%, -50%) rotate(${bottle.r}deg) scale(${bottle.s}) perspective(600px) rotateY(${bottle.tilt}deg)`,
            zIndex: 25,
            pointerEvents: 'none',
            willChange: 'left, top, transform',
          }}
        >
          <PETBottle
            width={220}
            crushed={isCrushed}
          />
        </div>

        {/* ── Scene 01: You Throw It Away ───────────────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '6vw',
            top: '50%',
            transform: `translateY(-50%) translateX(${(1 - op01) * -30}px)`,
            opacity: op01,
            pointerEvents: op01 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>01 / THE DISCARDED OBJECT</div>
          <h1 className="f-display" style={{ fontSize: 'clamp(3.8rem, 8.5vw, 7.5rem)', color: 'var(--text)', maxWidth: '44vw' }}>
            YOU THROW<br />IT AWAY.
          </h1>
          <p style={{ marginTop: '1.5rem', maxWidth: 380, lineHeight: 1.8, fontSize: '0.92rem', color: 'var(--muted)' }}>
            Every single day, millions of plastic bottles enter the waste stream. Without identity. Without tracking. Without value.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-dark" onClick={onStartFlow}>
              START WITH YOUR WASTE →
            </button>
            <button className="btn btn-outline" onClick={onExplore}>
              EXPLORE THE JOURNEY ↓
            </button>
          </div>
        </div>

        {/* ── Scene 02: Where Does It Go? ───────────────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '6vw',
            top: '50%',
            transform: `translateY(-50%) translateX(${(1 - op02) * -30}px)`,
            opacity: op02,
            pointerEvents: op02 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>02 / THE INVISIBLE DESTINATION</div>
          <h2 className="f-display" style={{ fontSize: 'clamp(3.2rem, 7.5vw, 6.8rem)', color: 'var(--text)', maxWidth: '46vw' }}>
            BUT WHERE<br /><span style={{ color: 'var(--accent)' }}>DOES IT GO?</span>
          </h2>
          <p style={{ marginTop: '1.5rem', maxWidth: 400, lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--muted)' }}>
            Recyclable materials vanish into mixed garbage, illegal dumping, and unmonitored landfills. The value is lost forever.
          </p>
        </div>

        {/* ── Scene 03: Approaching The Dustbin ─────────────────────────── */}
        <div
          className="scene-text"
          style={{
            right: '6vw',
            top: '50%',
            textAlign: 'right',
            transform: `translateY(-50%) translateX(${(1 - op03) * 30}px)`,
            opacity: op03,
            pointerEvents: op03 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>03 / THE TRADITIONAL ENDPOINT</div>
          <h2 className="f-display" style={{ fontSize: 'clamp(3rem, 7vw, 6.2rem)', color: 'var(--text)', maxWidth: '42vw', marginLeft: 'auto' }}>
            IT WAS<br />HEADING<br /><span style={{ color: 'rgba(23,23,23,0.3)' }}>HERE.</span>
          </h2>
          <p style={{ marginTop: '1.5rem', maxWidth: 360, lineHeight: 1.8, fontSize: '0.88rem', color: 'var(--muted)', marginLeft: 'auto' }}>
            Over 90% of plastic waste is mismanaged or dumped without traceability. Once in the bin, its loop ends.
          </p>
        </div>

        {/* ── Scene 04: The Intervention (Reversal) ─────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${0.9 + op04 * 0.1})`,
            textAlign: 'center',
            opacity: op04,
            pointerEvents: op04 > 0.5 ? 'auto' : 'none',
            width: '100%',
            zIndex: 25,
          }}
        >
          <div className="f-label mb-4" style={{ color: 'var(--accent)' }}>04 / SYSTEM INTERVENTION</div>
          <h2 className="f-display" style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: 'var(--text)', lineHeight: 0.9 }}>
            WHAT IF<br />IT DIDN'T<br /><span style={{ color: 'var(--accent)' }}>END THERE?</span>
          </h2>
        </div>

        {/* ── Scene 05: Every Bottle Has A Journey ──────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '6vw',
            top: '50%',
            transform: `translateY(-50%) translateX(${(1 - op05) * -30}px)`,
            opacity: op05,
            pointerEvents: op05 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--secondary)' }}>05 / DIGITAL INFRASTRUCTURE</div>
          <h2 className="f-display" style={{ fontSize: 'clamp(3.5rem, 8.5vw, 7.8rem)', color: 'var(--text)', maxWidth: '50vw' }}>
            EVERY BOTTLE<br /><span style={{ color: 'var(--accent)' }}>HAS A JOURNEY.</span>
          </h2>
          <p style={{ marginTop: '1.5rem', maxWidth: 420, lineHeight: 1.8, fontSize: '0.92rem', color: 'var(--muted)' }}>
            RECY-LINK assigns every recyclable material a tamper-evident digital identity, matches it with verified collectors, and tracks its path to circular renewal.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-dark" onClick={onStartFlow}>
              START WITH YOUR WASTE →
            </button>
          </div>
        </div>

        {/* ── Scene 06: AI Identification & Pathway ─────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '6vw',
            top: '50%',
            transform: `translateY(-50%) translateX(${(1 - op06) * -30}px)`,
            opacity: op06,
            pointerEvents: op06 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>06 / AI MATERIAL INTELLIGENCE</div>
          <h2 className="f-display mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.2rem)', maxWidth: '42vw' }}>
            IDENTIFY &<br /><span style={{ color: 'var(--secondary)' }}>OPTIMIZE PATHWAY.</span>
          </h2>
          <div style={{ border: '1px solid var(--border)', padding: '1.25rem 1.5rem', maxWidth: 360, background: 'rgba(242, 239, 231, 0.95)' }}>
            <div className="f-label mb-2" style={{ color: 'var(--muted)' }}>WASTE-TO-OPPORTUNITY ENGINE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div><span className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>MATERIAL:</span> <b style={{ fontSize: '0.8rem' }}>PET Clear</b></div>
              <div><span className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>CONFIDENCE:</span> <b style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>94%</b></div>
              <div><span className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>CONDITION:</span> <b style={{ fontSize: '0.8rem' }}>Good / Clean</b></div>
              <div><span className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>PATHWAY:</span> <b style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>RECYCLE</b></div>
            </div>
            <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} onClick={() => handleCategoryClick('pet')}>
              TEST AI ANALYSIS →
            </button>
          </div>
        </div>

        {/* ── Scene 07: Verified Collector ──────────────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '6vw',
            top: '50%',
            transform: `translateY(-50%) translateX(${(1 - op07) * -30}px)`,
            opacity: op07,
            pointerEvents: op07 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>07 / COLLECTOR INTEGRATION</div>
          <h2 className="f-display mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.2rem)', maxWidth: '42vw' }}>
            FORMAL DIGITAL<br /><span style={{ color: 'var(--secondary)' }}>IDENTITY.</span>
          </h2>
          <div style={{ border: '1px solid var(--border)', padding: '1.25rem', maxWidth: 320, background: 'rgba(242, 239, 231, 0.95)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div>
                <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>DIGITAL ID: C-0217</div>
                <div className="f-display" style={{ fontSize: '1.35rem' }}>Ramesh Kumar</div>
              </div>
              <span className="badge badge-green">✓ VERIFIED</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              Informal waste workers receive verified digital credentials, fair pricing, and direct pickup requests.
            </p>
          </div>
        </div>

        {/* ── Scene 08: Material Passport ───────────────────────────────── */}
        <div
          className="scene-text"
          style={{
            left: '6vw',
            top: '50%',
            transform: `translateY(-50%) translateX(${(1 - op08) * -30}px)`,
            opacity: op08,
            pointerEvents: op08 > 0.5 ? 'auto' : 'none',
            zIndex: 15,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>08 / MATERIAL PASSPORT</div>
          <h2 className="f-display mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.2rem)', maxWidth: '42vw' }}>
            ONE DIGITAL<br /><span style={{ color: 'var(--accent)' }}>PASSPORT.</span>
          </h2>
          <div style={{ border: '2px solid var(--text)', padding: '1.25rem', maxWidth: 320, background: 'rgba(242, 239, 231, 0.95)' }}>
            <div className="f-display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>MP-10482</div>
            <div className="f-label mb-2" style={{ color: 'var(--secondary)', fontSize: '0.55rem' }}>✓ POLYGON ANCHORED</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              42.8g PET Plastic · Household H-018 → Collector C-0217 → Recycler R-008
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SCENE 09: MATERIAL GALLERY (REFERENCE 05 COMPOSITION)
            The Hero PET Bottle physically lands in slot 1.
            The remaining material categories reveal in a horizontal row!
        ═════════════════════════════════════════════════════════════════ */}
        <div
          className="scene-text"
          style={{
            left: '4vw',
            right: '4vw',
            top: '50%',
            transform: `translateY(-50%) scale(${0.96 + op09 * 0.04})`,
            opacity: op09,
            pointerEvents: op09 > 0.5 ? 'auto' : 'none',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <div className="f-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>09 / RECY-LINK VALUE CHAIN</div>
              <h2 className="f-display" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 0.9 }}>
                EVERY MATERIAL<br /><span style={{ color: 'var(--accent)' }}>DESERVES THE RIGHT JOURNEY.</span>
              </h2>
            </div>
            <div className="f-label hide-mobile" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              CLICK ANY OBJECT TO LAUNCH AI CLASSIFICATION →
            </div>
          </div>

          {/* Horizontal Editorial Row of 6 Physical Material Objects */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '1.5rem',
              alignItems: 'flex-end',
              borderTop: '1px solid var(--border)',
              paddingTop: '2rem',
            }}
          >
            {/* Slot 1: PET Plastic Bottle (Hero Bottle lands right above this label!) */}
            <div
              onClick={() => handleCategoryClick('pet')}
              onMouseEnter={() => setHoveredMaterial('pet')}
              onMouseLeave={() => setHoveredMaterial(null)}
              style={{
                textAlign: 'center',
                cursor: 'none',
                transform: hoveredMaterial === 'pet' ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Ghost placeholder so the hero bottle visually docks here */}
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 130, border: '1px dashed rgba(126, 38, 50, 0.35)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="f-label" style={{ fontSize: '0.45rem', color: 'var(--accent)' }}>HERO OBJECT</span>
                </div>
              </div>
              <div className="f-display mt-3" style={{ fontSize: '1.1rem' }}>PET BOTTLE</div>
              <div className="f-label" style={{ color: 'var(--secondary)', fontSize: '0.55rem' }}>PLASTIC · RECYCLE</div>
            </div>

            {/* Slot 2: E-Waste Laptop / Phone */}
            <div
              onClick={() => handleCategoryClick('ewaste-laptop')}
              onMouseEnter={() => setHoveredMaterial('ewaste')}
              onMouseLeave={() => setHoveredMaterial(null)}
              style={{
                textAlign: 'center',
                cursor: 'none',
                transform: hoveredMaterial === 'ewaste' ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            >
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EWasteDevice width={110} />
              </div>
              <div className="f-display mt-3" style={{ fontSize: '1.1rem' }}>LAPTOP / PHONE</div>
              <div className="f-label" style={{ color: 'var(--accent)', fontSize: '0.55rem' }}>E-WASTE · RECOVERY</div>
            </div>

            {/* Slot 3: Hazardous Battery */}
            <div
              onClick={() => handleCategoryClick('hazardous-battery')}
              onMouseEnter={() => setHoveredMaterial('hazard')}
              onMouseLeave={() => setHoveredMaterial(null)}
              style={{
                textAlign: 'center',
                cursor: 'none',
                transform: hoveredMaterial === 'hazard' ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            >
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HazardousBattery width={85} />
              </div>
              <div className="f-display mt-3" style={{ fontSize: '1.1rem' }}>BATTERY / HAZMAT</div>
              <div className="f-label" style={{ color: '#DC2626', fontSize: '0.55rem' }}>SPECIALIZED ROUTING</div>
            </div>

            {/* Slot 4: Cardboard / Paper */}
            <div
              onClick={() => handleCategoryClick('paper')}
              onMouseEnter={() => setHoveredMaterial('paper')}
              onMouseLeave={() => setHoveredMaterial(null)}
              style={{
                textAlign: 'center',
                cursor: 'none',
                transform: hoveredMaterial === 'paper' ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            >
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardboardPackage width={110} />
              </div>
              <div className="f-display mt-3" style={{ fontSize: '1.1rem' }}>CARDBOARD</div>
              <div className="f-label" style={{ color: '#BC6C25', fontSize: '0.55rem' }}>PAPER · PULPING</div>
            </div>

            {/* Slot 5: Aluminium Can */}
            <div
              onClick={() => handleCategoryClick('pet')}
              onMouseEnter={() => setHoveredMaterial('metal')}
              onMouseLeave={() => setHoveredMaterial(null)}
              style={{
                textAlign: 'center',
                cursor: 'none',
                transform: hoveredMaterial === 'metal' ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            >
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AluminiumCan width={80} />
              </div>
              <div className="f-display mt-3" style={{ fontSize: '1.1rem' }}>ALU CAN</div>
              <div className="f-label" style={{ color: '#4B5563', fontSize: '0.55rem' }}>METAL · 100% RECYCLE</div>
            </div>

            {/* Slot 6: Glass Bottle */}
            <div
              onClick={() => handleCategoryClick('pet')}
              onMouseEnter={() => setHoveredMaterial('glass')}
              onMouseLeave={() => setHoveredMaterial(null)}
              style={{
                textAlign: 'center',
                cursor: 'none',
                transform: hoveredMaterial === 'glass' ? 'translateY(-8px)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            >
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GlassBottle width={68} />
              </div>
              <div className="f-display mt-3" style={{ fontSize: '1.1rem' }}>GLASS BOTTLE</div>
              <div className="f-label" style={{ color: 'var(--secondary)', fontSize: '0.55rem' }}>CULLET · REUSE</div>
            </div>
          </div>
        </div>

        {/* ── Scene 10: Circular Finale & Direct Action ──────────────────── */}
        <div
          className="scene-text"
          style={{
            left: 0,
            right: 0,
            top: '50%',
            transform: `translateY(-50%) scale(${0.92 + op10 * 0.08})`,
            textAlign: 'center',
            opacity: op10,
            pointerEvents: op10 > 0.5 ? 'auto' : 'none',
            padding: '0 5vw',
            zIndex: 25,
          }}
        >
          <div className="f-label mb-3" style={{ color: 'var(--muted)' }}>10 / WHERE WASTE ENDS, THE JOURNEY BEGINS</div>
          <h2 className="f-display mb-4" style={{ fontSize: 'clamp(3rem, 8.5vw, 7.5rem)', color: 'var(--text)', lineHeight: 0.9 }}>
            WHERE WASTE ENDS,<br /><span style={{ color: 'var(--accent)' }}>THE JOURNEY BEGINS.</span>
          </h2>
          <p style={{ maxWidth: 500, margin: '0 auto 2rem', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            Every material can become a new resource. Join thousands of households, institutions, and waste workers closing the loop with RECY-LINK.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-accent" onClick={onStartFlow}>
              START RECYCLING NOW →
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              REPLAY JOURNEY ↑
            </button>
          </div>
        </div>

        {/* ── Bottom Left Section Indicator ─────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 35,
          }}
        >
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <div>
            <div className="f-display" style={{ fontSize: '0.95rem', color: 'var(--accent)' }}>
              {STAGES[activeStageIdx].id}
            </div>
            <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>
              {STAGES[activeStageIdx].name}
            </div>
          </div>
        </div>

        {/* ── Bottom Right Stage Fraction ───────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2.5rem',
            zIndex: 35,
          }}
        >
          <div className="f-display" style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
            {STAGES[activeStageIdx].id} / 10
          </div>
        </div>
      </div>

      {/* ── Stage Indicator Dots on Right Rail ─────────────────────────── */}
      <div className="stage-indicator">
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className={`stage-dot ${activeStageIdx === i ? 'active' : ''}`}
            onClick={() => {
              const el = scrollerRef.current
              if (el) {
                const max = el.offsetHeight - window.innerHeight
                window.scrollTo({ top: (s.pct / 100) * max, behavior: 'smooth' })
              }
            }}
          >
            <span className="stage-dot-label">{s.name}</span>
            <div className="stage-dot-pip" />
          </div>
        ))}
      </div>

      {/* ── Top Scroll Progress Bar ───────────────────────────────────── */}
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </>
  )
}
