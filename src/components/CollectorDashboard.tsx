// Collector Dashboard — Digital Waste Worker ID, collection management, passport scanner
import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useStore, DEMO_COLLECTORS, recordBlockchainEvent } from '../store'
import type { JourneyStep } from '../store'

const COLLECTOR = DEMO_COLLECTORS[0] // C-0217 demo identity

type CollectorTab = 'id' | 'requests' | 'scanner' | 'history' | 'connections'

export function CollectorDashboard() {
  const { passports, updatePassport, addBlockchainEvent, awardPOP, collectionRequests, updateCollectionRequest } = useStore()
  const [tab, setTab] = useState<CollectorTab>('id')
  const [scanMode, setScanMode] = useState(false)
  const [scannedId, setScannedId] = useState('')
  const [scanResult, setScanResult] = useState<typeof passports[0] | null>(null)
  const [weight, setWeight] = useState('42.8')
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null)
  
  const myRequests = collectionRequests.filter(r => r.collectorId === COLLECTOR.id)
  const pendingRequests = myRequests.filter(r => r.status === 'assigned')
  
  const TABS: { id: CollectorTab; label: string }[] = [
    { id: 'id', label: 'MY ID' },
    { id: 'requests', label: 'COLLECTION REQUESTS' },
    { id: 'scanner', label: 'PASSPORT SCANNER' },
    { id: 'history', label: 'HISTORY' },
    { id: 'connections', label: 'RECYCLER CONNECTIONS' },
  ]
  
  async function handleConfirmHandover() {
    if (!scanResult) return
    setConfirming(true)
    
    await new Promise(r => setTimeout(r, 1800))
    const tx = await recordBlockchainEvent(`CollectorHandover(${scanResult.id},${COLLECTOR.id},${weight}g)`)
    addBlockchainEvent(`CollectorHandover(${scanResult.id},${COLLECTOR.id},${weight}g)`)
    
    updatePassport(scanResult.id, {
      status: 'collected' as JourneyStep,
      weight: parseFloat(weight),
      timeline: [
        ...scanResult.timeline,
        {
          step: 'collected' as JourneyStep,
          timestamp: new Date(),
          location: COLLECTOR.area,
          actor: `${COLLECTOR.id} (${COLLECTOR.name})`,
          blockchainTx: tx,
        },
      ],
    })
    
    // Update collection request
    const req = collectionRequests.find(r => r.passportId === scanResult.id)
    if (req) updateCollectionRequest(req.id, { status: 'collected' })
    
    awardPOP(5, 'Collection completed', scanResult.id)
    setConfirming(false)
    setConfirmed(true)
  }
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem 4vw 0', background: 'var(--bg)' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="font-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              WASTE COLLECTOR · {COLLECTOR.id}
            </div>
            <div className="font-display text-3xl">{COLLECTOR.name}</div>
          </div>
          <span className="collector-badge text-sm px-3 py-1">✓ VERIFIED</span>
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
              {t.id === 'requests' && pendingRequests.length > 0 && (
                <span
                  className="ml-2 px-1.5 py-0.5 text-xs"
                  style={{ background: 'var(--accent)', color: 'white', borderRadius: 2, fontSize: '0.55rem' }}
                >
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '3rem 4vw' }}>
        
        {/* ── DIGITAL ID ── */}
        {tab === 'id' && (
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                DIGITAL WASTE WORKER ID
              </div>
              
              {/* ID card */}
              <div
                style={{
                  border: '2px solid var(--text)',
                  padding: '2rem',
                  background: 'var(--bg)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background texture */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 6,
                    background: `repeating-linear-gradient(90deg, var(--secondary) 0, var(--secondary) 20%, var(--accent) 20%, var(--accent) 40%, var(--text) 40%, var(--text) 60%, var(--secondary) 60%, var(--secondary) 80%, var(--accent) 80%, var(--accent) 100%)`,
                  }}
                />
                
                <div className="flex justify-between items-start mt-2 mb-6">
                  <div>
                    <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>RECY-LINK NETWORK</div>
                    <div className="font-display text-xs" style={{ letterSpacing: '0.2em', opacity: 0.5 }}>WASTE WORKER CREDENTIAL</div>
                  </div>
                  <span className="collector-badge">✓ VERIFIED</span>
                </div>
                
                <div className="font-display text-5xl mb-1" style={{ letterSpacing: '0.05em' }}>{COLLECTOR.id}</div>
                <div className="font-display text-3xl mb-4">{COLLECTOR.name}</div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>AREA</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{COLLECTOR.area}</div>
                  </div>
                  <div>
                    <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>EXPERIENCE</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{COLLECTOR.experience}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>CERTIFIED MATERIALS</div>
                  <div className="flex gap-2 flex-wrap">
                    {COLLECTOR.materials.map(m => (
                      <span
                        key={m}
                        className="font-label px-2 py-1"
                        style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.6rem' }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="font-display text-2xl">{COLLECTOR.collections}</div>
                      <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>COLLECTIONS</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl">{COLLECTOR.recovered}</div>
                      <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>RECOVERED</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl">★ {COLLECTOR.rating}</div>
                      <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>RATING</div>
                    </div>
                  </div>
                </div>
                
                {/* QR on card */}
                <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', opacity: 0.6 }}>
                  <QRCodeSVG
                    value={`https://recy-link.app/collector/${COLLECTOR.id}`}
                    size={56}
                    bgColor="transparent"
                    fgColor="var(--text)"
                    level="H"
                  />
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div>
              <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                PERFORMANCE METRICS
              </div>
              <div className="space-y-0">
                {[
                  { label: 'Total Collections', value: COLLECTOR.collections },
                  { label: 'Material Recovered', value: COLLECTOR.recovered },
                  { label: 'PET Collected', value: '842 KG' },
                  { label: 'Paper Collected', value: '312 KG' },
                  { label: 'Metal Collected', value: '78 KG' },
                  { label: 'E-Waste Handled', value: '52 KG' },
                  { label: 'Avg. Daily Collections', value: '3.2' },
                  { label: 'Verified Handovers', value: '241' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex justify-between py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span style={{ fontSize: '0.82rem' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4" style={{ background: 'rgba(104,112,90,0.06)', border: '1px solid var(--secondary)' }}>
                <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--secondary)' }}>
                  SAFETY & HANDLING GUIDELINES
                </div>
                <ul className="space-y-1">
                  {[
                    'Always wear gloves when handling e-waste',
                    'Do not crush battery-containing devices',
                    'Separate contaminated from clean streams',
                    'Verify Material Passport before accepting',
                  ].map(g => (
                    <li key={g} style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      — {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* ── COLLECTION REQUESTS ── */}
        {tab === 'requests' && (
          <div>
            <h2 className="font-display text-4xl mb-2">COLLECTION REQUESTS</h2>
            <p className="mb-8" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              Nearby collection requests matching your material certifications and area.
            </p>
            
            {/* Nearby requests (always show some demo ones) */}
            <div className="space-y-4">
              {[
                { id: 'REQ-001', household: 'H-018', material: 'PET Plastic · 42.8g', location: 'Kothrud, Pune · 1.2 km', status: 'pending', time: '10 min ago', passport: passports.find(p => p.collectorId === COLLECTOR.id)?.id },
                { id: 'REQ-002', household: 'H-024', material: 'Cardboard · 280g', location: 'Kothrud, Pune · 0.9 km', status: 'pending', time: '25 min ago' },
                { id: 'REQ-003', household: 'H-031', material: 'Paper · 120g', location: 'Warje, Pune · 2.1 km', status: 'pending', time: '1 hr ago' },
              ].map((req) => (
                <div key={req.id} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-label mb-0.5" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>REQUEST {req.id}</div>
                      <div className="font-display text-xl">{req.material}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{req.time}</div>
                      {req.passport && (
                        <div className="font-label text-xs mt-1" style={{ color: 'var(--secondary)' }}>
                          Passport: {req.passport}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                    📍 {req.location} · Household {req.household}
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="btn-primary text-xs py-2 px-4"
                      onClick={() => {
                        setAcceptingRequest(req.id)
                        setTimeout(() => {
                          setAcceptingRequest(null)
                          setTab('scanner')
                        }, 1200)
                      }}
                    >
                      {acceptingRequest === req.id ? 'ACCEPTING...' : 'ACCEPT COLLECTION'}
                    </button>
                    <button className="btn-ghost text-xs py-2 px-4">VIEW MAP</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ── PASSPORT SCANNER ── */}
        {tab === 'scanner' && (
          <div style={{ maxWidth: 600 }}>
            <h2 className="font-display text-4xl mb-2">MATERIAL PASSPORT SCANNER</h2>
            <p className="mb-8" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              Scan or enter the Material Passport ID to record collection and trigger handover.
            </p>
            
            {!scanResult && !confirmed && (
              <div>
                {/* Mock scanner UI */}
                <div
                  className="relative mb-6"
                  style={{
                    border: '1px solid var(--border)',
                    padding: '3rem',
                    textAlign: 'center',
                    background: 'rgba(23,23,23,0.02)',
                  }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>⬛</div>
                  <div className="font-label mb-2" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                    CAMERA SCANNER
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    Point camera at QR code on Material Passport
                  </p>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: 100,
                      height: 100,
                      border: '2px solid var(--accent)',
                      animation: 'pulse-border 2s ease infinite',
                    }}
                  />
                </div>
                
                <div className="font-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                  OR ENTER PASSPORT ID MANUALLY
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={scannedId}
                    onChange={e => setScannedId(e.target.value)}
                    placeholder="e.g. MP-10482"
                    className="flex-1 px-4 py-3"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    className="btn-primary px-6 py-3"
                    onClick={() => {
                      const passport = passports.find(p => p.id === scannedId)
                      if (passport) setScanResult(passport)
                    }}
                  >
                    SCAN
                  </button>
                </div>
                
                {/* Demo shortcut */}
                <div className="mt-4 p-4" style={{ border: '1px solid var(--border)', background: 'rgba(23,23,23,0.02)' }}>
                  <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>DEMO</div>
                  <div className="flex gap-2 flex-wrap">
                    {passports.map(p => (
                      <button
                        key={p.id}
                        className="btn-ghost text-xs py-1 px-3"
                        onClick={() => setScanResult(p)}
                      >
                        {p.id}
                      </button>
                    ))}
                    {passports.length === 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        No passports yet. Ask household to upload waste first.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {scanResult && !confirmed && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)' }} />
                  <span className="font-label text-xs" style={{ color: 'var(--secondary)' }}>
                    PASSPORT FOUND — {scanResult.id}
                  </span>
                </div>
                
                <div style={{ border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="font-display text-3xl mb-2">{scanResult.id}</div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'MATERIAL', value: scanResult.material },
                      { label: 'SOURCE', value: scanResult.sourceId },
                      { label: 'PATHWAY', value: scanResult.pathway },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{item.label}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Weight input */}
                <div className="mb-6">
                  <div className="font-label mb-2" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                    RECORD WEIGHT (grams)
                  </div>
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full px-4 py-3"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
                
                <button
                  className="btn-primary w-full justify-center py-4"
                  onClick={handleConfirmHandover}
                  disabled={confirming}
                >
                  {confirming ? 'RECORDING VERIFIED HANDOVER...' : 'CONFIRM HANDOVER →'}
                </button>
                
                <button
                  className="btn-ghost w-full justify-center py-3 mt-3 text-xs"
                  onClick={() => setScanResult(null)}
                >
                  CANCEL
                </button>
              </div>
            )}
            
            {confirmed && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--secondary)' }} />
                  <span className="font-label text-xs" style={{ color: 'var(--secondary)' }}>
                    HANDOVER RECORDED · BLOCKCHAIN VERIFIED
                  </span>
                </div>
                
                <div className="font-display text-4xl mb-4" style={{ color: 'var(--secondary)' }}>
                  COLLECTION CONFIRMED
                </div>
                
                <div className="p-6 mb-6" style={{ border: '1px solid var(--secondary)', background: 'rgba(104,112,90,0.05)' }}>
                  {[
                    { label: 'PASSPORT', value: scanResult?.id },
                    { label: 'MATERIAL', value: scanResult?.material },
                    { label: 'WEIGHT RECORDED', value: `${weight} g` },
                    { label: 'COLLECTOR', value: COLLECTOR.id },
                    { label: 'TIMESTAMP', value: new Date().toLocaleTimeString('en-IN') },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(104,112,90,0.2)' }}>
                      <span className="font-label text-xs" style={{ color: 'var(--muted)' }}>{item.label}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                
                <div
                  className="p-4 blockchain-record mb-6"
                  style={{ background: '#0d1117', borderRadius: 2 }}
                >
                  <div style={{ color: '#68705A', marginBottom: 4 }}>✓ BLOCKCHAIN EVENT RECORDED</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>
                    CollectorHandover confirmed on Polygon
                  </div>
                </div>
                
                <button
                  className="btn-primary py-3 px-8"
                  onClick={() => { setScanResult(null); setConfirmed(false); setScannedId('') }}
                >
                  SCAN NEXT PASSPORT
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div>
            <h2 className="font-display text-4xl mb-8">COLLECTION HISTORY</h2>
            <div className="space-y-3">
              {[
                { id: 'MP-10481', material: 'PET Plastic', weight: '42.8g', date: 'Today', status: 'Handed over to R-008' },
                { id: 'MP-10479', material: 'E-Waste (Laptop)', weight: '1.8 kg', date: 'Yesterday', status: 'Processed' },
                { id: 'MP-10476', material: 'Paper/Cardboard', weight: '280g', date: '3 days ago', status: 'Processed' },
                { id: 'MP-10472', material: 'Metal Scrap', weight: '340g', date: '1 week ago', status: 'Processed' },
                { id: 'MP-10468', material: 'PET Plastic', weight: '156g', date: '10 days ago', status: 'Processed' },
              ].map(item => (
                <div key={item.id} className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-display text-lg">{item.id}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{item.material} · {item.weight}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{item.date}</div>
                  </div>
                  <span
                    className="font-label text-xs px-3 py-1"
                    style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.55rem' }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ── RECYCLER CONNECTIONS ── */}
        {tab === 'connections' && (
          <div>
            <h2 className="font-display text-4xl mb-8">RECYCLER CONNECTIONS</h2>
            <div className="space-y-4">
              {[
                { id: 'R-008', name: 'EcoCycle Pvt. Ltd.', area: 'Hadapsar, Pune', materials: ['PET', 'HDPE', 'PP', 'Paper', 'Metal'], capacity: '2 t/day', trusted: true, handovers: 87 },
                { id: 'R-015', name: 'PuneRecycle Hub', area: 'Kothrud, Pune', materials: ['Paper', 'Cardboard', 'Glass'], capacity: '800 kg/day', trusted: true, handovers: 45 },
                { id: 'R-022', name: 'E-Care Solutions', area: 'Baner, Pune', materials: ['E-Waste', 'Batteries', 'PCBs'], capacity: '300 kg/day', trusted: true, handovers: 12 },
              ].map(r => (
                <div key={r.id} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-label mb-0.5" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{r.id}</div>
                      <div className="font-display text-2xl">{r.name}</div>
                    </div>
                    {r.trusted && <span className="collector-badge">✓ TRUSTED</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>AREA</div>
                      <div style={{ fontSize: '0.78rem' }}>{r.area}</div>
                    </div>
                    <div>
                      <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>CAPACITY</div>
                      <div style={{ fontSize: '0.78rem' }}>{r.capacity}</div>
                    </div>
                    <div>
                      <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>MY HANDOVERS</div>
                      <div className="font-display text-xl">{r.handovers}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {r.materials.map(m => (
                      <span key={m} className="font-label px-2 py-0.5" style={{ border: '1px solid var(--border)', fontSize: '0.55rem', color: 'var(--muted)' }}>{m}</span>
                    ))}
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
