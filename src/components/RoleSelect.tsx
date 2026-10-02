// Role selection screen
import React, { useState } from 'react'
import { useStore } from '../store'
import { PETBottle } from './PETBottle'

const ROLES = [
  {
    id: 'household' as const,
    label: 'HOUSEHOLD',
    sub: 'Individual or family',
    desc: 'Upload waste, get AI analysis, request collection and track your material journey.',
    icon: '⌂',
  },
  {
    id: 'company' as const,
    label: 'COMPANY / INSTITUTION',
    sub: 'Organization or campus',
    desc: 'Manage bulk waste streams, schedule collections, access compliance-grade recycling records.',
    icon: '◫',
  },
  {
    id: 'collector' as const,
    label: 'WASTE COLLECTOR',
    sub: 'Informal or formal collector',
    desc: 'Get a verified digital identity, accept collection requests, scan Material Passports.',
    icon: '◑',
  },
]

export function RoleSelect() {
  const { setRole, setView, seedDemoData } = useStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [entering, setEntering] = useState(false)

  function handleEnter() {
    if (!selected) return
    setEntering(true)
    seedDemoData()
    setTimeout(() => {
      setRole(selected as any)
      setView('dashboard')
      setEntering(false)
    }, 900)
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center"
      style={{ background: 'var(--bg)', padding: '8vh 8vw' }}
    >
      {/* Header */}
      <div className="mb-16">
        <div className="font-label mb-4" style={{ color: 'var(--muted)' }}>
          STEP 01 / REGISTRATION
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 0.9 }}>
          HOW WILL YOU<br />
          <span style={{ color: 'var(--accent)' }}>USE RECY-LINK?</span>
        </h1>
      </div>

      {/* Role cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {ROLES.map((role) => (
          <button
            key={role.id}
            className={`role-card text-left ${selected === role.id ? 'selected' : ''}`}
            onClick={() => setSelected(role.id)}
            style={{ cursor: 'none' }}
          >
            <div
              className="font-display text-5xl mb-4"
              style={{ color: selected === role.id ? 'var(--accent)' : 'rgba(23,23,23,0.15)' }}
            >
              {role.icon}
            </div>
            <div className="font-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              {role.sub}
            </div>
            <div className="font-display text-2xl mb-3">{role.label}</div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--muted)' }}>{role.desc}</p>
            
            {selected === role.id && (
              <div
                className="mt-4 font-label text-xs"
                style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}
                />
                SELECTED
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Demo mode note */}
      <div
        className="mb-8 p-4"
        style={{ border: '1px solid var(--border)', background: 'rgba(23,23,23,0.03)' }}
      >
        <div className="font-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
          PROTOTYPE MODE
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          This is a working prototype. Pre-seeded with demo data: Household H-018, Collector C-0217, Recycler R-008, Material MP-10481. All workflows are functional. AI analysis uses a structured mock service replaceable with a production CV model.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-4 items-center">
        <button
          className="btn-primary px-10 py-4"
          onClick={handleEnter}
          style={{ opacity: selected ? 1 : 0.4 }}
        >
          {entering ? 'ENTERING...' : 'ENTER PLATFORM →'}
        </button>
        <button
          className="btn-ghost px-6 py-4"
          onClick={() => setView('landing')}
        >
          BACK
        </button>
      </div>

      {/* Decorative bottle */}
      <div
        className="fixed right-8 bottom-8 opacity-10 pointer-events-none"
        style={{ transform: 'rotate(12deg)' }}
      >
        <PETBottle width={100} />
      </div>
    </div>
  )
}
