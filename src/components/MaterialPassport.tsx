// Material Passport component — with QR, timeline, and blockchain records
import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useStore } from '../store'
import type { MaterialPassport, JourneyStep } from '../store'

const STEP_LABELS: Record<JourneyStep, string> = {
  identified: 'IDENTIFIED',
  collection_requested: 'COLLECTION REQUESTED',
  collected: 'COLLECTED',
  sorted: 'SORTED',
  transferred: 'TRANSFERRED',
  received: 'RECEIVED BY RECYCLER',
  processed: 'PROCESSED',
}

const ALL_STEPS: JourneyStep[] = [
  'identified',
  'collection_requested',
  'collected',
  'sorted',
  'transferred',
  'received',
  'processed',
]

function getStepStatus(passport: MaterialPassport, step: JourneyStep): 'done' | 'active' | 'pending' {
  const currentIdx = ALL_STEPS.indexOf(passport.status)
  const stepIdx = ALL_STEPS.indexOf(step)
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

export function MaterialPassportCard({ passport }: { passport: MaterialPassport }) {
  const [showQR, setShowQR] = useState(false)
  
  const passportUrl = `https://recy-link.app/passport/${passport.id}`
  
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="p-6"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(23,23,23,0.02)' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
              MATERIAL PASSPORT
            </div>
            <div className="font-display text-4xl mb-1" style={{ letterSpacing: '0.02em' }}>
              {passport.id}
            </div>
            <div className="font-label text-xs" style={{ color: 'var(--secondary)' }}>
              ✓ BLOCKCHAIN ANCHORED
            </div>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn-ghost text-xs py-2 px-3"
          >
            {showQR ? 'HIDE QR' : 'SHOW QR'}
          </button>
        </div>
        
        {showQR && (
          <div className="mt-6 flex gap-8 items-start">
            <div className="qr-container">
              <QRCodeSVG
                value={passportUrl}
                size={120}
                bgColor="transparent"
                fgColor="var(--text)"
                level="H"
              />
            </div>
            <div>
              <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
                SCAN TO VERIFY
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 260 }}>
                {passportUrl}
              </div>
              <div className="mt-3 font-label text-xs" style={{ color: 'var(--secondary)' }}>
                ← SCAN WITH RECY-LINK APP
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Material details */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'MATERIAL', value: passport.material },
          { label: 'WEIGHT', value: `${passport.weight} g` },
          { label: 'PATHWAY', value: passport.pathway },
          { label: 'SOURCE', value: passport.sourceId },
        ].map((item, i) => (
          <div
            key={item.label}
            className="p-4"
            style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{item.label}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
          </div>
        ))}
      </div>
      
      {/* Actors */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'ORIGIN', value: passport.sourceId, sub: 'Kothrud, Pune' },
          { label: 'COLLECTOR', value: passport.collectorId || '—', sub: passport.collectorId ? 'Ramesh Kumar' : 'Not yet assigned' },
          { label: 'RECYCLER', value: passport.recyclerId || '—', sub: passport.recyclerId ? 'EcoCycle Pvt. Ltd.' : 'Not yet received' },
        ].map((actor, i) => (
          <div
            key={actor.label}
            className="p-4"
            style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{actor.label}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{actor.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{actor.sub}</div>
          </div>
        ))}
      </div>
      
      {/* Journey timeline */}
      <div className="p-6">
        <div className="font-label mb-6" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
          MATERIAL JOURNEY TIMELINE
        </div>
        
        <div className="space-y-0">
          {ALL_STEPS.map((step, i) => {
            const status = getStepStatus(passport, step)
            const timelineEntry = passport.timeline.find((t) => t.step === step)
            
            return (
              <div key={step} className="flex gap-4 relative">
                {/* Line connector */}
                {i < ALL_STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: 20,
                      width: 1,
                      height: 'calc(100% + 0px)',
                      background: status === 'done' ? 'var(--secondary)' : 'var(--border)',
                      transition: 'background 0.3s',
                    }}
                  />
                )}
                
                {/* Dot */}
                <div style={{ flexShrink: 0, paddingTop: 3, zIndex: 1 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: status === 'done' ? 'var(--secondary)' :
                                   status === 'active' ? 'var(--accent)' : 'transparent',
                      border: status === 'pending' ? '1px solid var(--border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.3s',
                    }}
                  >
                    {status === 'done' && (
                      <span style={{ color: 'white', fontSize: '8px', lineHeight: 1 }}>✓</span>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div
                  className="pb-6 flex-1"
                  style={{ paddingLeft: 4, opacity: status === 'pending' ? 0.4 : 1 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-label text-xs" style={{
                      color: status === 'active' ? 'var(--accent)' :
                              status === 'done' ? 'var(--text)' : 'var(--muted)',
                    }}>
                      {STEP_LABELS[step]}
                    </div>
                    {timelineEntry && (
                      <div className="font-label text-xs" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>
                        {timelineEntry.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  
                  {timelineEntry && (
                    <>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
                        {timelineEntry.actor} · {timelineEntry.location}
                      </div>
                      {timelineEntry.blockchainTx && (
                        <div
                          className="blockchain-record mt-1"
                          style={{ fontSize: '0.55rem' }}
                        >
                          tx: {timelineEntry.blockchainTx.slice(0, 20)}...
                          <span style={{ color: 'var(--secondary)', marginLeft: 6 }}>✓ VERIFIED</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {status === 'active' && !timelineEntry && (
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent)',
                        marginTop: 2,
                        animation: 'pulse-border 2s ease infinite',
                      }}
                    >
                      IN PROGRESS...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Final status message */}
        {passport.status === 'processed' && (
          <div
            className="mt-4 p-4"
            style={{ background: 'rgba(104,112,90,0.08)', border: '1px solid var(--secondary)' }}
          >
            <div className="font-label text-xs mb-1" style={{ color: 'var(--secondary)' }}>
              ✓ MATERIAL RECYCLED · JOURNEY COMPLETE
            </div>
            <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
              Your material has been responsibly processed by {passport.recyclerId}.
              A tamper-evident blockchain record has been created.
              {passport.pop_awarded > 0 && (
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {' '}+{passport.pop_awarded} POP awarded.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MaterialPassportView() {
  const { passports, activePassportId, setActivePassportId, userId } = useStore()
  const householdPassports = passports.filter(p => p.sourceId === userId)
  const activePassport = activePassportId ? passports.find(p => p.id === activePassportId) : null
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-4xl">MATERIAL PASSPORTS</h2>
        {activePassport && householdPassports.length > 1 && (
          <button
            className="btn-ghost text-xs py-2 px-4"
            onClick={() => setActivePassportId(null)}
          >
            VIEW ALL
          </button>
        )}
      </div>
      
      {!activePassport && householdPassports.length === 0 && (
        <div className="text-center py-16" style={{ border: '1px dashed var(--border)' }}>
          <div className="font-display text-2xl mb-3 opacity-40">NO PASSPORTS YET</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Upload waste to generate your first Material Passport.</p>
        </div>
      )}
      
      {/* Passport list if no active */}
      {!activePassport && householdPassports.length > 0 && (
        <div className="space-y-3 mb-8">
          <div className="font-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
            SELECT A PASSPORT TO VIEW
          </div>
          {householdPassports.map((p) => (
            <button
              key={p.id}
              className="w-full p-4 text-left"
              style={{ border: '1px solid var(--border)', cursor: 'none' }}
              onClick={() => setActivePassportId(p.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-display text-xl">{p.id}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {p.material} · {p.weight}g · {p.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <span
                  className="font-label text-xs px-3 py-1"
                  style={{
                    border: '1px solid var(--secondary)',
                    color: 'var(--secondary)',
                    fontSize: '0.55rem',
                  }}
                >
                  {p.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {activePassport && (
        <MaterialPassportCard passport={activePassport} />
      )}
    </div>
  )
}
