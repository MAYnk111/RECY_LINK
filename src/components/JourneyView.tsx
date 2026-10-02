// Journey view — "Where Did My Waste Go?"
import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { PETBottle } from './PETBottle'

const JOURNEY_STAGES = [
  { key: 'identified', label: 'IDENTIFIED', location: 'Kothrud, Pune', time: '10:15', actor: 'H-018 (Priya Sharma)' },
  { key: 'collection_requested', label: 'COLLECTION REQUESTED', location: 'Kothrud, Pune', time: '10:18', actor: 'H-018 (Priya Sharma)' },
  { key: 'collected', label: 'COLLECTED', location: 'Kothrud, Pune', time: '14:42', actor: 'C-0217 (Ramesh Kumar)' },
  { key: 'sorted', label: 'SORTED', location: 'Warje Sorting Facility', time: '13:18', actor: 'Warje Sorting Hub' },
  { key: 'transferred', label: 'TRANSFERRED', location: 'Warje → Hadapsar', time: '15:06', actor: 'Logistics Partner' },
  { key: 'received', label: 'RECEIVED', location: 'Hadapsar Recycling Hub', time: '16:41', actor: 'R-008 (EcoCycle)' },
  { key: 'processed', label: 'RECYCLED', location: 'Hadapsar Recycling Hub', time: 'NEXT DAY 09:05', actor: 'R-008 (EcoCycle)' },
]

export function JourneyView() {
  const { passports, activePassportId, setActivePassportId, userId, awardPOP, addBlockchainEvent, updatePassport } = useStore()
  const householdPassports = passports.filter(p => p.sourceId === userId)
  const [revealIdx, setRevealIdx] = useState(-1)
  const [revealing, setRevealing] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [bottlePos, setBottlePos] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const targetPassport = activePassportId
    ? passports.find(p => p.id === activePassportId)
    : householdPassports[0]
  
  function startJourney() {
    setRevealing(true)
    setRevealIdx(-1)
    let idx = 0
    
    intervalRef.current = setInterval(() => {
      setRevealIdx(idx)
      setBottlePos(idx / (JOURNEY_STAGES.length - 1))
      idx++
      if (idx >= JOURNEY_STAGES.length) {
        clearInterval(intervalRef.current!)
        setRevealing(false)
        setRevealed(true)
        
        // Award POP for first completed demo
        if (targetPassport && targetPassport.status !== 'processed') {
          updatePassport(targetPassport.id, {
            status: 'processed',
            recyclerId: 'R-008',
            pop_awarded: 20,
            timeline: [
              ...targetPassport.timeline,
              { step: 'collected' as any, timestamp: new Date(Date.now() - 5 * 3600000), location: 'Kothrud, Pune', actor: 'C-0217 (Ramesh Kumar)' },
              { step: 'sorted' as any, timestamp: new Date(Date.now() - 4 * 3600000), location: 'Warje Facility', actor: 'Warje Sorting Hub' },
              { step: 'transferred' as any, timestamp: new Date(Date.now() - 3 * 3600000), location: 'Warje → Hadapsar', actor: 'Logistics' },
              { step: 'received' as any, timestamp: new Date(Date.now() - 2 * 3600000), location: 'Hadapsar Hub', actor: 'R-008' },
              { step: 'processed' as any, timestamp: new Date(Date.now() - 1 * 3600000), location: 'Hadapsar Hub', actor: 'R-008' },
            ],
          })
          awardPOP(20, 'PET recycling verified', targetPassport.id)
          addBlockchainEvent(`ProcessingComplete(${targetPassport.id}) — recycler: R-008`)
        }
      }
    }, 650)
  }
  
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])
  
  if (householdPassports.length === 0) {
    return (
      <div>
        <h2 className="font-display text-4xl mb-4">WHERE DID IT GO?</h2>
        <div
          className="text-center py-16"
          style={{ border: '1px dashed var(--border)' }}
        >
          <PETBottle width={80} className="mx-auto mb-4 opacity-30" />
          <div className="font-display text-xl mb-2 opacity-40">NO MATERIAL TO TRACE</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Upload waste first to track its journey.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <h2 className="font-display text-4xl mb-2">WHERE DID IT GO?</h2>
      <p className="mb-8" style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.7 }}>
        Follow the complete physical journey of your material — from identification to verified recycling.
      </p>
      
      {/* Passport selector */}
      {householdPassports.length > 1 && (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {householdPassports.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActivePassportId(p.id); setRevealIdx(-1); setRevealed(false) }}
              className="font-label text-xs px-4 py-2 whitespace-nowrap"
              style={{
                border: activePassportId === p.id || (!activePassportId && p === householdPassports[0])
                  ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: activePassportId === p.id ? 'var(--accent)' : 'var(--muted)',
                cursor: 'none',
              }}
            >
              {p.id}
            </button>
          ))}
        </div>
      )}
      
      {/* Journey viz */}
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left — journey stages */}
        <div>
          <div
            className="font-display text-2xl mb-6"
            style={{ color: 'var(--accent)' }}
          >
            {targetPassport?.id || householdPassports[0]?.id}
          </div>
          
          {!revealed && !revealing && (
            <button
              className="btn-primary w-full justify-center py-5 mb-8 text-sm"
              onClick={startJourney}
            >
              WHERE DID MY WASTE GO? →
            </button>
          )}
          
          {(revealing || revealed) && (
            <div className="space-y-0">
              {JOURNEY_STAGES.map((stage, i) => {
                const isVisible = i <= revealIdx
                const isActive = i === revealIdx && revealing
                
                return (
                  <div
                    key={stage.key}
                    className="flex gap-4 relative"
                    style={{
                      opacity: isVisible ? 1 : 0.15,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    {i < JOURNEY_STAGES.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 10,
                          top: 22,
                          width: 1,
                          height: 'calc(100% + 0px)',
                          background: isVisible ? 'var(--secondary)' : 'var(--border)',
                          transition: 'background 0.5s ease',
                        }}
                      />
                    )}
                    
                    <div style={{ flexShrink: 0, zIndex: 1, paddingTop: 4 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: isActive ? 'var(--accent)' : isVisible ? 'var(--secondary)' : 'transparent',
                          border: !isVisible ? '1px solid var(--border)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.3s',
                          boxShadow: isActive ? '0 0 0 4px rgba(126,38,50,0.2)' : 'none',
                        }}
                      >
                        {isVisible && !isActive && (
                          <span style={{ color: 'white', fontSize: 9 }}>✓</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="pb-6 flex-1">
                      <div
                        className="font-display text-lg"
                        style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}
                      >
                        {stage.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>
                        {stage.time} · {stage.location}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                        {stage.actor}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {revealed && (
            <div
              className="mt-4 p-6"
              style={{ background: 'rgba(104,112,90,0.08)', border: '1px solid var(--secondary)' }}
            >
              <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--secondary)' }}>
                ✓ MATERIAL RECYCLED · JOURNEY COMPLETE
              </div>
              <div className="font-display text-3xl mb-2">YOUR MATERIAL HAS BEEN RECYCLED.</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                42.8g of PET plastic from your household has been successfully processed by EcoCycle Pvt. Ltd. A tamper-evident blockchain record has been created.
              </p>
              <div
                className="flex gap-6"
                style={{ borderTop: '1px solid rgba(104,112,90,0.3)', paddingTop: '1rem', marginTop: '0.5rem' }}
              >
                <div>
                  <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>POP EARNED</div>
                  <div className="font-display text-3xl" style={{ color: 'var(--accent)' }}>+20</div>
                </div>
                <div>
                  <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>BLOCKCHAIN</div>
                  <div className="font-label text-xs" style={{ color: 'var(--secondary)' }}>✓ VERIFIED</div>
                </div>
                <div>
                  <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>RECYCLER</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>R-008</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right — animated bottle */}
        <div className="flex flex-col items-center gap-8 sticky" style={{ top: '20vh' }}>
          <div
            style={{
              transform: `rotate(${(bottlePos - 0.5) * 30}deg) scale(${0.8 + bottlePos * 0.4})`,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <PETBottle width={140} crushed={bottlePos > 0.5} />
          </div>
          
          {revealIdx >= 0 && (
            <div className="text-center">
              <div
                className="font-display text-3xl"
                style={{ color: 'var(--accent)', animation: 'fade-up 0.4s ease' }}
              >
                {JOURNEY_STAGES[Math.min(revealIdx, JOURNEY_STAGES.length - 1)].label}
              </div>
              <div className="font-label mt-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                {JOURNEY_STAGES[Math.min(revealIdx, JOURNEY_STAGES.length - 1)].location}
              </div>
            </div>
          )}
          
          {/* Map placeholder */}
          {revealed && (
            <div
              className="w-full map-placeholder"
              style={{ height: 200, position: 'relative', overflow: 'hidden' }}
            >
              {/* SVG map visualization */}
              <svg width="100%" height="100%" viewBox="0 0 400 200">
                <rect width="400" height="200" fill="#e8e4da" />
                {/* Grid lines */}
                {[50, 100, 150, 200, 250, 300, 350].map(x => (
                  <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="rgba(23,23,23,0.06)" strokeWidth="1" />
                ))}
                {[50, 100, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(23,23,23,0.06)" strokeWidth="1" />
                ))}
                {/* Journey path */}
                <polyline
                  points="80,80 160,100 240,70 320,120"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
                {/* Nodes */}
                {[
                  { x: 80, y: 80, label: 'H-018', color: 'var(--text)' },
                  { x: 160, y: 100, label: 'C-0217', color: 'var(--secondary)' },
                  { x: 240, y: 70, label: 'SORTING', color: 'var(--muted)' },
                  { x: 320, y: 120, label: 'R-008', color: 'var(--accent)' },
                ].map((node) => (
                  <g key={node.label}>
                    <circle cx={node.x} cy={node.y} r={8} fill={node.color} opacity={0.8} />
                    <text x={node.x} y={node.y + 20} textAnchor="middle" fontSize="9" fill="rgba(23,23,23,0.6)" fontFamily="monospace">
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
              <div
                className="absolute bottom-2 right-2 font-label text-xs px-2 py-1"
                style={{ background: 'rgba(23,23,23,0.7)', color: 'white', fontSize: '0.55rem' }}
              >
                PUNE, INDIA
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
