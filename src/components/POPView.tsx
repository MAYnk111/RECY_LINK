// POP — Proof of Participation view
import React, { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { gsap } from 'gsap'

export function POPView() {
  const { pop, popHistory } = useStore()
  const popRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!popRef.current) return
    const target = { val: 0 }
    gsap.to(target, {
      val: pop,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: () => {
        if (popRef.current) {
          popRef.current.textContent = Math.round(target.val).toLocaleString()
        }
      },
    })
  }, [pop])
  
  // Categories
  const total = popHistory.reduce((acc, p) => acc + p.amount, 0)
  const categories = [
    { label: 'Recycling Verified', amount: popHistory.filter(p => p.reason.includes('recycl')).reduce((a, p) => a + p.amount, 0), color: 'var(--secondary)' },
    { label: 'E-Waste Disposal', amount: popHistory.filter(p => p.reason.includes('E-waste')).reduce((a, p) => a + p.amount, 0), color: 'var(--accent)' },
    { label: 'Correct Segregation', amount: popHistory.filter(p => p.reason.includes('segreg')).reduce((a, p) => a + p.amount, 0), color: 'var(--text)' },
    { label: 'Community Participation', amount: popHistory.filter(p => p.reason.includes('Community')).reduce((a, p) => a + p.amount, 0), color: 'var(--muted)' },
    { label: 'Handover Verified', amount: popHistory.filter(p => p.reason.includes('handover') || p.reason.includes('collection')).reduce((a, p) => a + p.amount, 0), color: '#8fa0b8' },
  ]
  
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* POP score */}
        <div>
          <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
            PROOF OF PARTICIPATION
          </div>
          <div className="flex items-end gap-4 mb-2">
            <div
              ref={popRef}
              className="font-display"
              style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 1, color: 'var(--accent)' }}
            >
              {pop.toLocaleString()}
            </div>
            <div className="font-display text-4xl mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }}>
              POP
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 400, marginBottom: '2rem' }}>
            POP is your verified participation score in responsible recycling. Each POP represents a real, verifiable environmental action — not a token, not a currency.
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'VERIFIED ACTIONS', value: popHistory.length },
              { label: 'KG DIVERTED', value: '18.4' },
              { label: 'RANK', value: '#142' },
            ].map((stat) => (
              <div key={stat.label} style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div className="font-display text-3xl mb-1">{stat.value}</div>
                <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* How to earn */}
        <div>
          <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
            HOW TO EARN POP
          </div>
          <div className="space-y-0">
            {[
              { action: 'Correct waste segregation', pop: '+10' },
              { action: 'Verified recycling handover', pop: '+20' },
              { action: 'Verified e-waste disposal', pop: '+25' },
              { action: 'Repeated responsible participation', pop: '+10' },
              { action: 'Community recycling event', pop: '+5' },
              { action: 'Bulk institutional collection', pop: '+30' },
            ].map((item) => (
              <div
                key={item.action}
                className="flex justify-between items-center py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: '0.8rem' }}>{item.action}</span>
                <span
                  className="font-display text-lg"
                  style={{ color: 'var(--secondary)', minWidth: 50, textAlign: 'right' }}
                >
                  {item.pop}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* POP history */}
      <div>
        <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
          POP HISTORY
        </div>
        <div className="space-y-3">
          {popHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="font-display text-2xl"
                  style={{ color: 'var(--secondary)', minWidth: 64 }}
                >
                  +{entry.amount}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{entry.reason}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                    {entry.timestamp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {entry.passportId && ` · ${entry.passportId}`}
                  </div>
                </div>
              </div>
              {entry.passportId && (
                <span
                  className="font-label text-xs px-2 py-1"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.55rem' }}
                >
                  ✓ VERIFIED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
