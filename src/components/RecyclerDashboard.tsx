// Recycler Dashboard
import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useStore, DEMO_RECYCLER, recordBlockchainEvent } from '../store'
import type { JourneyStep } from '../store'

type RecyclerTab = 'incoming' | 'queue' | 'passports' | 'completed'

export function RecyclerDashboard() {
  const { passports, updatePassport, addBlockchainEvent, awardPOP } = useStore()
  const [tab, setTab] = useState<RecyclerTab>('incoming')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [processedIds, setProcessedIds] = useState<string[]>([])
  
  const TABS: { id: RecyclerTab; label: string }[] = [
    { id: 'incoming', label: 'INCOMING MATERIALS' },
    { id: 'queue', label: 'PROCESSING QUEUE' },
    { id: 'passports', label: 'MATERIAL PASSPORTS' },
    { id: 'completed', label: 'COMPLETED' },
  ]
  
  const incomingPassports = passports.filter(p => ['collected', 'sorted', 'transferred'].includes(p.status))
  const processingPassports = passports.filter(p => p.status === 'received')
  const completedPassports = passports.filter(p => p.status === 'processed')
  
  async function handleReceive(passportId: string) {
    const passport = passports.find(p => p.id === passportId)
    if (!passport) return
    
    setProcessingId(passportId)
    await new Promise(r => setTimeout(r, 1200))
    const tx = await recordBlockchainEvent(`RecyclerReceived(${passportId},${DEMO_RECYCLER.id})`)
    addBlockchainEvent(`RecyclerReceived(${passportId},${DEMO_RECYCLER.id})`)
    
    updatePassport(passportId, {
      status: 'received' as JourneyStep,
      recyclerId: DEMO_RECYCLER.id,
      timeline: [
        ...passport.timeline,
        { step: 'received' as JourneyStep, timestamp: new Date(), location: DEMO_RECYCLER.area, actor: `${DEMO_RECYCLER.id} (${DEMO_RECYCLER.name})`, blockchainTx: tx },
      ],
    })
    setProcessingId(null)
  }
  
  async function handleProcess(passportId: string) {
    const passport = passports.find(p => p.id === passportId)
    if (!passport) return
    
    setProcessingId(passportId)
    await new Promise(r => setTimeout(r, 1600))
    const tx = await recordBlockchainEvent(`MaterialProcessed(${passportId},${DEMO_RECYCLER.id})`)
    addBlockchainEvent(`MaterialProcessed(${passportId},${DEMO_RECYCLER.id}) — VERIFIED`)
    
    updatePassport(passportId, {
      status: 'processed' as JourneyStep,
      pop_awarded: 20,
      timeline: [
        ...passport.timeline,
        { step: 'processed' as JourneyStep, timestamp: new Date(), location: DEMO_RECYCLER.area, actor: `${DEMO_RECYCLER.id} (${DEMO_RECYCLER.name})`, blockchainTx: tx },
      ],
    })
    
    awardPOP(20, 'PET recycling verified', passportId)
    setProcessedIds(prev => [...prev, passportId])
    setProcessingId(null)
  }
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem 4vw 0' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="font-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              RECYCLER · {DEMO_RECYCLER.id}
            </div>
            <div className="font-display text-3xl">{DEMO_RECYCLER.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
              {DEMO_RECYCLER.area} · Capacity: {DEMO_RECYCLER.capacity}
            </div>
          </div>
          <div className="flex gap-4">
            {DEMO_RECYCLER.certifications.map(cert => (
              <span
                key={cert}
                className="font-label px-3 py-1"
                style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.6rem' }}
              >
                ✓ {cert}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="font-label text-xs px-5 py-3 whitespace-nowrap"
              style={{
                cursor: 'none',
                color: tab === t.id ? 'var(--accent)' : 'var(--muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '3rem 4vw' }}>
        
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'INCOMING', value: incomingPassports.length + 3 },
            { label: 'IN PROCESSING', value: processingPassports.length + 4 },
            { label: 'COMPLETED TODAY', value: completedPassports.length + 8 },
            { label: 'TOTAL KG THIS MONTH', value: '1,842' },
          ].map(s => (
            <div key={s.label} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
              <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{s.label}</div>
              <div className="font-display text-4xl">{s.value}</div>
            </div>
          ))}
        </div>
        
        {/* ── INCOMING ── */}
        {tab === 'incoming' && (
          <div>
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              MATERIALS AWAITING RECEIPT
            </div>
            
            {/* Demo incoming list */}
            <div className="space-y-4">
              {[
                { id: 'MP-10481', material: 'PET Plastic', weight: '42.8g', collector: 'C-0217', origin: 'H-018, Kothrud' },
                { id: 'MP-10478', material: 'PET Plastic', weight: '156g', collector: 'C-0217', origin: 'H-024, Kothrud' },
                { id: 'MP-10475', material: 'HDPE Plastic', weight: '92g', collector: 'C-0182', origin: 'H-031, Karve Nagar' },
                ...incomingPassports.map(p => ({ id: p.id, material: p.material, weight: `${p.weight}g`, collector: p.collectorId || 'C-0217', origin: `${p.sourceId}, Kothrud` })),
              ].map(item => (
                <div key={item.id} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-display text-2xl mb-1">{item.id}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {item.material} · {item.weight}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                        From: {item.origin} via {item.collector}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="btn-ghost text-xs py-2 px-4"
                      >
                        SCAN QR
                      </button>
                      <button
                        className="btn-primary text-xs py-2 px-4"
                        onClick={() => handleReceive(item.id)}
                        disabled={processingId === item.id}
                      >
                        {processingId === item.id ? 'RECEIVING...' : 'CONFIRM RECEIPT'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ── PROCESSING QUEUE ── */}
        {tab === 'queue' && (
          <div>
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              PROCESSING QUEUE
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'MP-10480', material: 'PET Plastic', weight: '18.2 KG', batch: 'B-2026-142', line: 'Line 2' },
                { id: 'MP-10477', material: 'PET Plastic', weight: '8.4 KG', batch: 'B-2026-141', line: 'Line 2' },
                ...processingPassports.map(p => ({ id: p.id, material: p.material, weight: `${p.weight}g`, batch: `B-2026-143`, line: 'Line 1' })),
              ].map(item => (
                <div key={item.id} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-display text-2xl mb-1">{item.id}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {item.material} · {item.weight} · Batch {item.batch}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                        Assigned to {item.line}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className={processedIds.includes(item.id) ? 'btn-ghost text-xs py-2 px-4 opacity-50' : 'btn-accent text-xs py-2 px-4'}
                        onClick={() => handleProcess(item.id)}
                        disabled={processingId === item.id || processedIds.includes(item.id)}
                      >
                        {processedIds.includes(item.id) ? '✓ PROCESSED' :
                          processingId === item.id ? 'PROCESSING...' : 'MARK PROCESSED'}
                      </button>
                    </div>
                  </div>
                  
                  {processedIds.includes(item.id) && (
                    <div
                      className="mt-3 p-3 blockchain-record"
                      style={{ background: '#0d1117', borderRadius: 2 }}
                    >
                      <span style={{ color: '#68705A' }}>✓ BLOCKCHAIN EVENT RECORDED — PROCESSING COMPLETE</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ── PASSPORTS ── */}
        {tab === 'passports' && (
          <div>
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              ALL MATERIAL PASSPORTS
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'MP-10480', material: 'PET Plastic', weight: '18,200g', status: 'PROCESSED', recycler: DEMO_RECYCLER.id },
                { id: 'MP-10477', material: 'PET Plastic', weight: '8,400g', status: 'PROCESSED', recycler: DEMO_RECYCLER.id },
                { id: 'MP-10474', material: 'Paper', weight: '5,200g', status: 'PROCESSING', recycler: DEMO_RECYCLER.id },
                ...passports.filter(p => p.recyclerId === DEMO_RECYCLER.id).map(p => ({
                  id: p.id, material: p.material, weight: `${p.weight}g`, status: p.status.toUpperCase().replace(/_/g, ' '), recycler: DEMO_RECYCLER.id
                })),
              ].map(p => (
                <div key={p.id} className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-display text-xl">{p.id}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.material} · {p.weight}</div>
                  </div>
                  <span
                    className="font-label text-xs px-3 py-1"
                    style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.55rem' }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ── COMPLETED ── */}
        {tab === 'completed' && (
          <div>
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              COMPLETED RECYCLING RECORDS
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'MP-10480', material: 'PET Plastic', weight: '18.2 KG', date: '3 days ago', household: 'PCCoE Campus', tx: '0xa4f8...2e1d' },
                { id: 'MP-10479', material: 'E-Waste', weight: '1.8 KG', date: '1 week ago', household: 'H-015', tx: '0xc2e1...9a3b' },
                { id: 'MP-10477', material: 'HDPE Plastic', weight: '8.4 KG', date: '1 week ago', household: 'PCCoE Campus', tx: '0xf7b3...4c8e' },
                ...completedPassports.map(p => ({ id: p.id, material: p.material, weight: `${p.weight}g`, date: 'Today', household: p.sourceId, tx: '0xd9a2...7f1c' })),
              ].map(item => (
                <div key={item.id} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-display text-xl mb-1">{item.id}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {item.material} · {item.weight} · From: {item.household}
                      </div>
                      <div className="blockchain-record mt-2" style={{ fontSize: '0.6rem' }}>
                        tx: {item.tx} <span style={{ color: 'var(--secondary)', marginLeft: 6 }}>✓ VERIFIED ON POLYGON</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{item.date}</div>
                      <span
                        className="font-label mt-2 block px-3 py-1 text-xs"
                        style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.55rem' }}
                      >
                        ✓ PROCESSED
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
