// Household Dashboard — complete workflow
import React, { useState, useRef, useCallback } from 'react'
import { useStore, analyzWaste, recordBlockchainEvent, DEMO_COLLECTORS, generatePassportId2 } from '../store'
import type { MaterialPassport, WasteAnalysis } from '../store'
import { MaterialPassportView } from './MaterialPassport'
import { JourneyView } from './JourneyView'
import { POPView } from './POPView'
import { PETBottle } from './PETBottle'

type HouseholdTab = 'home' | 'upload' | 'passport' | 'journey' | 'pop' | 'history'

function AnalysisResult({ analysis, onRequestCollection }: { analysis: WasteAnalysis; onRequestCollection: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)' }} />
        <span className="font-label text-xs" style={{ color: 'var(--secondary)' }}>ANALYSIS COMPLETE — {analysis.confidence}% CONFIDENCE</span>
      </div>
      
      <div className="font-display text-4xl mb-1">{analysis.material}</div>
      <div className="font-label text-xs mb-6" style={{ color: 'var(--muted)' }}>{analysis.category} · {analysis.condition} Condition</div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: '1px solid var(--border)' }}>
        {[
          { label: 'MATERIAL', value: analysis.material },
          { label: 'CONDITION', value: analysis.condition },
          { label: 'CONTAMINATION', value: analysis.contamination },
          { label: 'EST. WEIGHT', value: `${analysis.estimatedWeight} g` },
        ].map((item, i) => (
          <div key={item.label} className="p-4" style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)' }}>
            <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{item.label}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
          </div>
        ))}
      </div>
      
      {/* Recommended pathway */}
      <div
        className="p-6 mt-4"
        style={{ border: '2px solid var(--secondary)', background: 'rgba(104,112,90,0.05)' }}
      >
        <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>RECOMMENDED PATHWAY</div>
        <div className="font-display text-4xl mb-2" style={{ color: 'var(--secondary)' }}>
          {analysis.recommendedPathway}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Based on material condition, contamination level and available processing capabilities.
        </div>
        
        {/* Pathway options */}
        <div className="flex gap-2 flex-wrap mb-6">
          {analysis.pathwayOptions.map((p) => (
            <span
              key={p}
              className="px-3 py-1 font-label text-xs"
              style={{
                border: p === analysis.recommendedPathway ? '1px solid var(--secondary)' : '1px solid var(--border)',
                background: p === analysis.recommendedPathway ? 'var(--secondary)' : 'transparent',
                color: p === analysis.recommendedPathway ? 'white' : 'var(--muted)',
              }}
            >
              {p}
            </span>
          ))}
        </div>
        
        <button
          className="btn-primary w-full justify-center py-4"
          onClick={onRequestCollection}
        >
          REQUEST COLLECTION →
        </button>
      </div>
    </div>
  )
}

function CollectorList({ analysis, onAssign }: { analysis: WasteAnalysis; onAssign: (collectorId: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  
  return (
    <div>
      <div className="font-label mb-6" style={{ color: 'var(--muted)' }}>MATCHING VERIFIED COLLECTORS NEAR YOU</div>
      
      <div className="space-y-4 mb-8">
        {DEMO_COLLECTORS.map((c) => (
          <div
            key={c.id}
            className="p-6"
            style={{
              border: selected === c.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: selected === c.id ? 'rgba(126,38,50,0.04)' : 'var(--bg)',
              cursor: 'none',
              transition: 'border 0.2s, background 0.2s',
              opacity: c.available ? 1 : 0.4,
            }}
            onClick={() => c.available && setSelected(c.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-label text-xs mb-0.5" style={{ color: 'var(--muted)' }}>{c.id}</div>
                <div className="font-display text-2xl">{c.name}</div>
              </div>
              <div className="text-right">
                <span
                  className="font-label text-xs px-2 py-1"
                  style={{
                    border: `1px solid ${c.available ? 'var(--secondary)' : 'var(--muted)'}`,
                    color: c.available ? 'var(--secondary)' : 'var(--muted)',
                  }}
                >
                  {c.available ? '● AVAILABLE' : '○ BUSY'}
                </span>
                <div className="font-label mt-1" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{c.distance}</div>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>AREA</div>
                <div style={{ fontSize: '0.75rem' }}>{c.area}</div>
              </div>
              <div>
                <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>MATERIALS</div>
                <div style={{ fontSize: '0.75rem' }}>{c.materials.join(' · ')}</div>
              </div>
              <div>
                <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>COLLECTIONS</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.collections}</div>
              </div>
              <div>
                <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>RATING</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>★ {c.rating}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        className="btn-accent w-full justify-center py-4"
        onClick={() => selected && onAssign(selected)}
        style={{ opacity: selected ? 1 : 0.4 }}
      >
        ASSIGN SELECTED COLLECTOR →
      </button>
    </div>
  )
}

export function HouseholdDashboard() {
  const {
    uploadedImage, setUploadedImage,
    analysis, setAnalysis,
    analyzing, setAnalyzing,
    addPassport, updatePassport, getPassport,
    activePassportId, setActivePassportId,
    addCollectionRequest, updateCollectionRequest,
    setSelectedCollectorId,
    awardPOP, addBlockchainEvent,
    passports, pop, popHistory,
    userId, userName,
    setView,
  } = useStore()
  
  const [tab, setTab] = useState<HouseholdTab>('home')
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result' | 'collectors' | 'creating' | 'created'>('upload')
  const [creatingPassport, setCreatingPassport] = useState(false)
  const [passportId, setPassportId] = useState<string | null>(null)
  const [blockchainTx, setBlockchainTx] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  
  const handleFileUpload = useCallback(async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setUploadedImage(dataUrl)
      setAnalyzing(true)
      setStep('analyzing')
      try {
        const result = await analyzWaste(dataUrl)
        setAnalysis(result)
        setStep('result')
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }, [setUploadedImage, setAnalyzing, setAnalysis])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])
  
  const handleRequestCollection = () => setStep('collectors')
  
  const handleAssignCollector = async (collectorId: string) => {
    setSelectedCollectorId(collectorId)
    setStep('creating')
    setCreatingPassport(true)
    
    // Simulate passport creation
    await new Promise(r => setTimeout(r, 1400))
    const pid = generatePassportId2()
    setPassportId(pid)
    
    // Record blockchain event
    const tx = await recordBlockchainEvent(`MaterialCreated(${pid})`)
    setBlockchainTx(tx)
    addBlockchainEvent(`MaterialCreated(${pid}) — source: ${userId}`)
    
    // Create passport
    const passport: MaterialPassport = {
      id: pid,
      material: analysis?.material || 'PET Plastic',
      category: analysis?.category || 'Plastic',
      weight: analysis?.estimatedWeight || 42.8,
      source: 'Household',
      sourceId: userId,
      collectorId,
      recyclerId: null,
      status: 'collection_requested',
      createdAt: new Date(),
      pathway: analysis?.recommendedPathway || 'RECYCLE',
      pop_awarded: 0,
      imageUrl: uploadedImage || undefined,
      timeline: [
        {
          step: 'identified',
          timestamp: new Date(Date.now() - 60000),
          location: 'Kothrud, Pune',
          actor: `${userId} (${userName})`,
          blockchainTx: tx,
        },
        {
          step: 'collection_requested',
          timestamp: new Date(),
          location: 'Kothrud, Pune',
          actor: `${userId} (${userName})`,
        },
      ],
    }
    
    addPassport(passport)
    setActivePassportId(pid)
    
    // Add collection request
    addCollectionRequest({
      id: `CR-${Date.now()}`,
      passportId: pid,
      userId,
      status: 'assigned',
      collectorId,
      createdAt: new Date(),
      location: 'Kothrud, Pune',
    })
    
    setCreatingPassport(false)
    setStep('created')
  }
  
  const activePassport = activePassportId ? getPassport(activePassportId) : null
  const householdPassports = passports.filter(p => p.sourceId === userId)
  
  const TABS: { id: HouseholdTab; label: string }[] = [
    { id: 'home', label: 'OVERVIEW' },
    { id: 'upload', label: 'UPLOAD WASTE' },
    { id: 'passport', label: 'MATERIAL PASSPORT' },
    { id: 'journey', label: 'WHERE DID IT GO?' },
    { id: 'pop', label: 'POP' },
    { id: 'history', label: 'HISTORY' },
  ]
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
      {/* Dashboard header */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '2rem 4vw 0',
          background: 'var(--bg)',
        }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="font-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              HOUSEHOLD · {userId}
            </div>
            <div className="font-display text-3xl">{userName}</div>
          </div>
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <div className="font-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>TOTAL POP</div>
              <div className="font-display text-3xl" style={{ color: 'var(--accent)' }}>{pop.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>PASSPORTS</div>
              <div className="font-display text-3xl">{householdPassports.length}</div>
            </div>
          </div>
        </div>
        
        {/* Tab nav */}
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="font-label text-xs px-5 py-3 whitespace-nowrap border-b-2 transition-colors"
              style={{
                cursor: 'none',
                borderBottomColor: tab === t.id ? 'var(--accent)' : 'transparent',
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
      
      {/* Tab content */}
      <div style={{ padding: '3rem 4vw' }}>
        
        {/* ── OVERVIEW ── */}
        {tab === 'home' && (
          <div>
            <div className="grid md:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'TOTAL POP', value: pop.toLocaleString(), accent: true },
                { label: 'MATERIAL PASSPORTS', value: householdPassports.length },
                { label: 'KG DIVERTED', value: householdPassports.reduce((acc, p) => acc + (p.weight / 1000), 0).toFixed(1) },
                { label: 'VERIFIED ACTIONS', value: popHistory.length },
              ].map((stat) => (
                <div key={stat.label} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
                    {stat.label}
                  </div>
                  <div
                    className="font-display text-4xl"
                    style={{ color: stat.accent ? 'var(--accent)' : 'var(--text)' }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick actions */}
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>QUICK ACTIONS</div>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {[
                { label: 'UPLOAD WASTE', desc: 'Photograph and identify material', action: () => setTab('upload') },
                { label: 'WHERE DID IT GO?', desc: 'Trace your material journey', action: () => setTab('journey') },
                { label: 'VIEW MY POP', desc: 'Proof of Participation history', action: () => setTab('pop') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="btn-ghost text-left p-5"
                  style={{ width: '100%', cursor: 'none' }}
                >
                  <div className="font-display text-lg mb-1">{action.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{action.desc}</div>
                </button>
              ))}
            </div>
            
            {/* Recent passports */}
            {householdPassports.length > 0 && (
              <div>
                <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>RECENT MATERIAL PASSPORTS</div>
                <div className="space-y-3">
                  {householdPassports.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <div>
                        <div className="font-display text-lg">{p.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.material} · {p.weight}g</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="font-label text-xs px-3 py-1"
                          style={{
                            border: '1px solid var(--secondary)',
                            color: 'var(--secondary)',
                            textTransform: 'uppercase',
                            fontSize: '0.6rem',
                          }}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                        <button
                          className="btn-ghost text-xs py-1 px-3"
                          onClick={() => { setActivePassportId(p.id); setTab('passport') }}
                        >
                          VIEW →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {householdPassports.length === 0 && (
              <div
                className="text-center py-16"
                style={{ border: '1px dashed var(--border)' }}
              >
                <PETBottle width={80} className="mx-auto mb-6 opacity-30" />
                <div className="font-display text-2xl mb-2">NO MATERIALS YET</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                  Upload your first waste photo to begin tracing.
                </p>
                <button className="btn-primary" onClick={() => setTab('upload')}>
                  UPLOAD WASTE →
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ── UPLOAD WASTE ── */}
        {tab === 'upload' && (
          <div style={{ maxWidth: 700 }}>
            <h2 className="font-display text-4xl mb-2">UPLOAD YOUR WASTE</h2>
            <p className="mb-8" style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.7 }}>
              Photograph your waste material. Our AI will identify the material, assess condition, and recommend the optimal processing pathway.
            </p>
            
            {step === 'upload' && (
              <>
                <div
                  className="border-2 border-dashed p-12 text-center mb-6"
                  style={{ borderColor: 'var(--border)', cursor: 'none' }}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                >
                  <PETBottle width={80} className="mx-auto mb-4 opacity-40" />
                  <div className="font-display text-2xl mb-2">DROP IMAGE HERE</div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>or click to browse</p>
                </div>
                
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="btn-primary justify-center py-4" onClick={() => fileRef.current?.click()}>
                    TAKE PHOTO
                  </button>
                  <button className="btn-ghost justify-center py-4" onClick={() => fileRef.current?.click()}>
                    UPLOAD IMAGE
                  </button>
                </div>
                
                {/* Demo shortcut */}
                <div className="mt-6 p-4" style={{ border: '1px solid var(--border)', background: 'rgba(23,23,23,0.02)' }}>
                  <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>DEMO MODE</div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                    To quickly demonstrate AI analysis without uploading a real image, click below:
                  </p>
                  <button
                    className="btn-accent text-sm py-2 px-4"
                    onClick={async () => {
                      setUploadedImage('data:image/png;base64,demo')
                      setAnalyzing(true)
                      setStep('analyzing')
                      const result = await analyzWaste('demo')
                      setAnalysis(result)
                      setStep('result')
                      setAnalyzing(false)
                    }}
                  >
                    DEMO: ANALYZE PLASTIC BOTTLE →
                  </button>
                </div>
              </>
            )}
            
            {step === 'analyzing' && (
              <div className="text-center py-16">
                <div
                  className="w-24 h-24 border-2 mx-auto mb-8 relative"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* Scan animation */}
                  <div
                    className="absolute left-0 right-0 h-0.5"
                    style={{
                      background: 'var(--accent)',
                      animation: 'scanline 2s ease-in-out infinite',
                      top: 0,
                    }}
                  />
                  <PETBottle width={60} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="font-display text-3xl mb-3" style={{ color: 'var(--accent)' }}>ANALYZING MATERIAL...</div>
                <div className="font-label text-xs" style={{ color: 'var(--muted)' }}>IDENTIFYING MATERIAL — ASSESSING CONDITION — SELECTING PATHWAY</div>
                <div className="mt-6 space-y-2 max-w-xs mx-auto">
                  {['Detecting material type...', 'Assessing contamination...', 'Checking quality indicators...', 'Selecting optimal pathway...'].map((msg, i) => (
                    <div
                      key={msg}
                      className="flex items-center gap-2"
                      style={{ animation: `fade-up 0.4s ease ${i * 0.6}s both` }}
                    >
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--secondary)' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step === 'result' && analysis && (
              <div>
                {uploadedImage && uploadedImage !== 'data:image/png;base64,demo' && (
                  <div className="mb-6">
                    <img
                      src={uploadedImage}
                      alt="Uploaded waste"
                      style={{ maxHeight: 200, width: 'auto', border: '1px solid var(--border)' }}
                    />
                  </div>
                )}
                <AnalysisResult analysis={analysis} onRequestCollection={handleRequestCollection} />
              </div>
            )}
            
            {step === 'collectors' && analysis && (
              <div>
                <div className="font-display text-4xl mb-2">REQUEST COLLECTION</div>
                <p className="mb-6" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                  Select a verified collector near you to pick up your material.
                </p>
                <CollectorList analysis={analysis} onAssign={handleAssignCollector} />
              </div>
            )}
            
            {step === 'creating' && (
              <div className="text-center py-16">
                <div className="font-display text-3xl mb-4" style={{ color: 'var(--accent)' }}>
                  CREATING MATERIAL PASSPORT...
                </div>
                <div className="space-y-3 max-w-sm mx-auto">
                  {[
                    'Generating unique Material ID...',
                    'Recording blockchain event...',
                    'Assigning verified collector...',
                    'Notifying collector C-0217...',
                  ].map((msg, i) => (
                    <div key={msg} className="flex items-center gap-2" style={{ animation: `fade-up 0.4s ${i * 0.5}s both` }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--secondary)' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step === 'created' && passportId && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--secondary)' }} />
                  <span className="font-label text-xs" style={{ color: 'var(--secondary)' }}>
                    MATERIAL PASSPORT CREATED
                  </span>
                </div>
                
                <div className="font-display text-5xl mb-2" style={{ color: 'var(--accent)' }}>{passportId}</div>
                <div className="font-label mb-6" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                  MATERIAL PASSPORT ID — BLOCKCHAIN ANCHORED
                </div>
                
                {blockchainTx && (
                  <div
                    className="p-4 mb-6 blockchain-record"
                    style={{ background: '#0d1117', borderRadius: 2 }}
                  >
                    <div style={{ color: '#68705A', marginBottom: 4 }}>✓ BLOCKCHAIN EVENT RECORDED</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all', fontSize: '0.6rem' }}>
                      tx: {blockchainTx.slice(0, 48)}...
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div style={{ border: '1px solid var(--border)', padding: '1rem' }}>
                    <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>COLLECTOR</div>
                    <div style={{ fontWeight: 600 }}>{useStore.getState().selectedCollectorId}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Ramesh Kumar · Kothrud</div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', padding: '1rem' }}>
                    <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>STATUS</div>
                    <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>● COLLECTION REQUESTED</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    className="btn-primary py-3 px-6"
                    onClick={() => { setTab('passport'); setActivePassportId(passportId) }}
                  >
                    VIEW PASSPORT →
                  </button>
                  <button
                    className="btn-ghost py-3 px-6"
                    onClick={() => {
                      setStep('upload')
                      setUploadedImage(null)
                      setAnalysis(null)
                      setPassportId(null)
                      setBlockchainTx(null)
                    }}
                  >
                    UPLOAD ANOTHER
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ── MATERIAL PASSPORT ── */}
        {tab === 'passport' && (
          <MaterialPassportView />
        )}
        
        {/* ── JOURNEY ── */}
        {tab === 'journey' && (
          <JourneyView />
        )}
        
        {/* ── POP ── */}
        {tab === 'pop' && (
          <POPView />
        )}
        
        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div>
            <h2 className="font-display text-4xl mb-8">RECYCLING HISTORY</h2>
            {householdPassports.length === 0 ? (
              <div className="text-center py-16" style={{ border: '1px dashed var(--border)' }}>
                <div className="font-display text-xl mb-3 opacity-40">NO HISTORY YET</div>
                <button className="btn-primary mt-4" onClick={() => setTab('upload')}>
                  START WITH YOUR FIRST UPLOAD
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {householdPassports.map((p) => (
                  <div
                    key={p.id}
                    className="p-6"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-display text-2xl mb-1">{p.id}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {p.material} · {p.weight}g · {p.pathway}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>
                          {p.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="font-label text-xs px-3 py-1"
                          style={{
                            border: '1px solid var(--secondary)',
                            color: 'var(--secondary)',
                            textTransform: 'uppercase',
                            fontSize: '0.55rem',
                          }}
                        >
                          {p.status.replace(/_/g, ' ')}
                        </span>
                        <button
                          className="btn-ghost text-xs py-1 px-3"
                          onClick={() => { setActivePassportId(p.id); setTab('passport') }}
                        >
                          TRACE →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
