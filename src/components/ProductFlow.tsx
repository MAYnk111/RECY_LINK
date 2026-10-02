/**
 * ProductFlow — Unified Interactive Workspace
 * 
 * Houses all functional workflows:
 *  - Mode Switcher: Household, Company/Campus, Collector, Recycler
 *  - Multi-category AI Analysis (PET, E-Waste, Hazardous, Paper/Cardboard, Metal, Glass)
 *  - Waste-to-Opportunity Decision Engine
 *  - Material Passport Generator & QR System
 *  - Animated "Where Did My Waste Go?" Journey Reconstruction
 *  - Digital Waste Worker ID & Passport Scanner
 *  - Institutional E-Waste & Compliance Reports
 *  - Real-time POP Credits and Blockchain Tamper-Evident Records
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { gsap } from 'gsap'
import { PETBottle } from './PETBottle'
import {
  EWasteDevice,
  HazardousBattery,
  CardboardPackage,
  AluminiumCan,
  GlassBottle,
} from './MaterialObjects'
import {
  useStore,
  analyzWaste,
  recordBlockchainEvent,
  DEMO_COLLECTORS,
  DEMO_RECYCLER,
  generatePassportId2,
} from '../store'
import type {
  WasteAnalysis,
  MaterialPassport,
  JourneyStep,
} from '../store'

type Role = 'household' | 'collector' | 'company' | 'recycler'
type HouseholdTab = 'identify' | 'passports' | 'journey' | 'pop'

interface ProductFlowProps {
  onClose: () => void
  defaultRole?: Role | null
  initialCategory?: string | null
}

export function ProductFlow({ onClose, defaultRole, initialCategory }: ProductFlowProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [activeRole, setActiveRole] = useState<Role>(defaultRole || 'household')
  const { seedDemoData, userId, userName, pop, popHistory, passports, getPassport, activePassportId, setActivePassportId } = useStore()

  useEffect(() => {
    seedDemoData()
  }, [seedDemoData])

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg)',
        zIndex: 10000,
      }}
    >
      {/* Top Bar with Navigation & Mode Switcher */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10100,
          background: 'rgba(242, 239, 231, 0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.55rem' }}
          >
            ← BACK TO CINEMATIC CANVAS
          </button>
          <div className="f-display" style={{ fontSize: '1.15rem', letterSpacing: '0.1em' }}>
            RECY-LINK WORKSPACE
          </div>
        </div>

        {/* Role Mode Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(23, 23, 23, 0.05)', padding: '0.25rem', borderRadius: 4 }}>
          {[
            { id: 'household' as Role, label: 'HOUSEHOLD' },
            { id: 'company' as Role, label: 'COMPANY / CAMPUS' },
            { id: 'collector' as Role, label: 'COLLECTOR' },
            { id: 'recycler' as Role, label: 'RECYCLER' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className="f-label"
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                cursor: 'none',
                background: activeRole === r.id ? 'var(--text)' : 'transparent',
                color: activeRole === r.id ? 'var(--bg)' : 'var(--muted)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace Body with Natural Document Scroll */}
      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '3rem 2.5rem 8rem', minHeight: '80vh' }}>
        {activeRole === 'household' && <HouseholdWorkspace initialCategory={initialCategory} />}
        {activeRole === 'company' && <CompanyWorkspace />}
        {activeRole === 'collector' && <CollectorWorkspace />}
        {activeRole === 'recycler' && <RecyclerWorkspace />}
      </main>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════════════════════
   1. HOUSEHOLD WORKSPACE
═════════════════════════════════════════════════════════════════════════════ */
function HouseholdWorkspace({ initialCategory }: { initialCategory?: string | null }) {
  const [tab, setTab] = useState<HouseholdTab>('identify')
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result' | 'collectors' | 'created'>('upload')
  const [selectedCollector, setSelectedCollector] = useState<string>('C-0217')
  const [activeCategoryHint, setActiveCategoryHint] = useState<string>(initialCategory || 'pet')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    uploadedImage,
    setUploadedImage,
    analysis,
    setAnalysis,
    analyzing,
    setAnalyzing,
    addPassport,
    activePassportId,
    setActivePassportId,
    getPassport,
    passports,
    addCollectionRequest,
    addBlockchainEvent,
    userId,
    userName,
    pop,
    popHistory,
  } = useStore()

  const runAnalysis = async (hint: string, customImg?: string) => {
    setActiveCategoryHint(hint)
    setAnalyzing(true)
    setStep('analyzing')
    if (customImg) setUploadedImage(customImg)

    const result = await analyzWaste(hint)
    setAnalysis(result)
    setAnalyzing(false)
    setStep('result')
  }

  // Trigger auto-analysis if opened with initial category
  useEffect(() => {
    if (initialCategory) {
      runAnalysis(initialCategory)
    }
  }, [initialCategory])

  const handleCreatePassport = async () => {
    setAnalyzing(true)
    await new Promise((r) => setTimeout(r, 1400))
    const pid = generatePassportId2()
    const tx = await recordBlockchainEvent(`MaterialCreated(${pid})`)
    addBlockchainEvent(`MaterialCreated(${pid}) — Origin: ${userId} (${userName})`)

    const newPassport: MaterialPassport = {
      id: pid,
      material: analysis?.material || 'PET Clear Bottle',
      category: analysis?.category || 'Plastic',
      weight: analysis?.estimatedWeight || 42.8,
      source: 'Household',
      sourceId: userId,
      collectorId: analysis?.isHazardous ? null : selectedCollector,
      recyclerId: analysis?.isHazardous ? 'R-022 (Specialized E-Waste & Chemical Hub)' : null,
      status: 'collection_requested',
      createdAt: new Date(),
      pathway: analysis?.recommendedPathway || 'RECYCLE',
      pop_awarded: 0,
      imageUrl: uploadedImage || undefined,
      timeline: [
        {
          step: 'identified',
          timestamp: new Date(Date.now() - 30000),
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

    addPassport(newPassport)
    setActivePassportId(pid)
    addCollectionRequest({
      id: `CR-${Date.now().toString().slice(-6)}`,
      passportId: pid,
      userId,
      status: 'assigned',
      collectorId: selectedCollector,
      createdAt: new Date(),
      location: 'Kothrud, Pune',
    })

    setAnalyzing(false)
    setStep('created')
  }

  const myPassports = passports.filter((p) => p.sourceId === userId)
  const currentPassport = activePassportId ? getPassport(activePassportId) : myPassports[0]

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>USER PROFILE: {userId}</div>
          <h2 className="f-display" style={{ fontSize: '2.2rem' }}>{userName}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'identify' as HouseholdTab, label: 'IDENTIFY & UPLOAD' },
            { id: 'passports' as HouseholdTab, label: `PASSPORTS (${myPassports.length})` },
            { id: 'journey' as HouseholdTab, label: 'WHERE DID IT GO?' },
            { id: 'pop' as HouseholdTab, label: `POP SCORE (${pop})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="btn btn-outline"
              style={{
                borderColor: tab === t.id ? 'var(--text)' : 'var(--border)',
                background: tab === t.id ? 'var(--text)' : 'transparent',
                color: tab === t.id ? 'var(--bg)' : 'var(--text)',
                padding: '0.5rem 1rem',
                fontSize: '0.55rem',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: IDENTIFY & UPLOAD ── */}
      {tab === 'identify' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3.5rem', alignItems: 'start' }}>
          <div>
            {step === 'upload' && (
              <>
                <div className="f-label mb-2" style={{ color: 'var(--muted)' }}>STEP 01 / WHAT ARE YOU RECYCLING?</div>
                <h3 className="f-display mb-3" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
                  UPLOAD WASTE PHOTO
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                  Our Waste-to-Opportunity Engine determines whether the material should be <b>Reused</b>, <b>Refurbished</b>, <b>Recovered</b>, <b>Recycled</b>, or routed to <b>Specialized Handling</b>.
                </p>

                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border)',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    cursor: 'none',
                    background: 'rgba(23, 23, 23, 0.02)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <PETBottle width={60} style={{ opacity: 0.35, margin: '0 auto 1rem' }} />
                  <div className="f-display mb-1" style={{ fontSize: '1.4rem' }}>DROP WASTE IMAGE HERE</div>
                  <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>OR CLICK TO BROWSE DEVICE CAMERA / STORAGE</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      const r = new FileReader()
                      r.onload = (ev) => runAnalysis('pet', ev.target?.result as string)
                      r.readAsDataURL(f)
                    }
                  }}
                />

                {/* Category Quick Tests */}
                <div className="f-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>
                  DEMO CATEGORY TESTS (CLICK TO SIMULATE REAL AI VISION CLASSIFIER):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={() => runAnalysis('pet')}>
                    🍾 1. PET Plastic Bottle
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={() => runAnalysis('ewaste-laptop')}>
                    💻 2. E-Waste: Dell Laptop
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={() => runAnalysis('ewaste-phone')}>
                    📱 3. E-Waste: Working Phone
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={() => runAnalysis('hazardous-battery')}>
                    ⚠️ 4. Hazardous: Swollen Battery
                  </button>
                  <button className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={() => runAnalysis('paper')}>
                    📦 5. Cardboard / Paper
                  </button>
                </div>
              </>
            )}

            {step === 'analyzing' && (
              <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div style={{ width: 70, height: 70, border: '1px solid var(--border)', margin: '0 auto 1.5rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'var(--accent)', animation: 'scanline 1.5s ease-in-out infinite' }} />
                  <PETBottle width={40} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <div className="f-display mb-2" style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>ANALYZING MATERIAL INTELLIGENCE...</div>
                <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>ASSESSING CONTAMINATION · DETECTING HAZARDS · COMPUTING BEST PATHWAY</div>
              </div>
            )}

            {step === 'result' && analysis && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="f-label" style={{ color: analysis.isHazardous ? 'var(--accent)' : 'var(--secondary)' }}>
                    ✓ AI ANALYSIS COMPLETE · {analysis.confidence}% CONFIDENCE
                  </span>
                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.5rem' }} onClick={() => setStep('upload')}>
                    RESET
                  </button>
                </div>

                <h3 className="f-display mb-1" style={{ fontSize: '2.5rem' }}>{analysis.material}</h3>
                <div className="f-label mb-4" style={{ color: 'var(--muted)' }}>
                  CATEGORY: {analysis.category} · CONDITION: {analysis.condition} · CONTAMINATION: {analysis.contamination}
                </div>

                {/* Waste to Opportunity Engine Recommendation Card */}
                <div
                  style={{
                    border: `2px solid ${analysis.isHazardous ? 'var(--accent)' : 'var(--secondary)'}`,
                    background: analysis.isHazardous ? 'rgba(126, 38, 50, 0.05)' : 'rgba(104, 112, 90, 0.06)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div className="f-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>
                    WASTE-TO-OPPORTUNITY ENGINE DECISION:
                  </div>
                  <div className="f-display mb-2" style={{ fontSize: '2.2rem', color: analysis.isHazardous ? 'var(--accent)' : 'var(--secondary)' }}>
                    {analysis.recommendedPathway}
                  </div>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text)', marginBottom: '1rem' }}>
                    {analysis.decisionRationale}
                  </p>

                  {/* E-Waste specific inspection breakdown */}
                  {analysis.ewasteDetails && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                      <div className="f-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>E-WASTE COMPONENT ASSESSMENT:</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                        <b>Battery:</b> {analysis.ewasteDetails.batteryStatus} <br />
                        <b>Hazardous Elements:</b> {analysis.ewasteDetails.hazardousComponents.join(', ')} <br />
                        <b>Recoverable:</b> {analysis.ewasteDetails.recoverableComponents.join(', ')} <br />
                        <b>Routing:</b> {analysis.ewasteDetails.recommendedAction}
                      </div>
                    </div>
                  )}

                  {/* Hazardous safety warning */}
                  {analysis.hazardDetails && (
                    <div style={{ borderTop: '1px solid var(--accent)', paddingTop: '0.75rem', marginTop: '0.75rem', color: 'var(--accent)' }}>
                      <div className="f-label mb-1" style={{ fontSize: '0.55rem' }}>⚠️ SAFETY NOTICE:</div>
                      <div style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                        {analysis.hazardDetails.safetyWarning}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                {!analysis.isHazardous ? (
                  <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={() => setStep('collectors')}>
                    SELECT VERIFIED COLLECTOR →
                  </button>
                ) : (
                  <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={handleCreatePassport}>
                    DISPATCH TO AUTHORIZED HAZARDOUS HANDLER →
                  </button>
                )}
              </div>
            )}

            {step === 'collectors' && (
              <div>
                <div className="f-label mb-2" style={{ color: 'var(--muted)' }}>STEP 02 / MATCH NEARBY COLLECTOR</div>
                <h3 className="f-display mb-4" style={{ fontSize: '2rem' }}>VERIFIED COLLECTOR MATCHING</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {DEMO_COLLECTORS.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => c.available && setSelectedCollector(c.id)}
                      style={{
                        padding: '1.25rem',
                        border: selectedCollector === c.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: selectedCollector === c.id ? 'rgba(126, 38, 50, 0.04)' : 'transparent',
                        cursor: c.available ? 'none' : 'not-allowed',
                        opacity: c.available ? 1 : 0.4,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div>
                          <div className="f-display" style={{ fontSize: '1.25rem' }}>{c.name}</div>
                          <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>ID: {c.id} · {c.area} ({c.distance})</div>
                        </div>
                        <span className="badge badge-green">★ {c.rating} VERIFIED</span>
                      </div>
                      <div className="f-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>
                        Materials: {c.materials.join(' · ')} · {c.collections} successful collections
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={handleCreatePassport}>
                  CONFIRM & GENERATE MATERIAL PASSPORT →
                </button>
              </div>
            )}

            {step === 'created' && (
              <div>
                <div className="f-label mb-2" style={{ color: 'var(--secondary)' }}>✓ MATERIAL PASSPORT GENERATED</div>
                <h3 className="f-display mb-3" style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>{activePassportId}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Your material is officially registered on Polygon blockchain. The assigned collector has been dispatched.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-dark" onClick={() => setTab('journey')}>
                    TRACK PHYSICAL JOURNEY →
                  </button>
                  <button className="btn btn-outline" onClick={() => { setStep('upload'); setUploadedImage(null); setAnalysis(null); }}>
                    UPLOAD NEXT ITEM
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Preview Column: Continuous Visual Material Anchor */}
          <div style={{ border: '1px solid var(--border)', padding: '2.5rem 2rem', textAlign: 'center', background: 'rgba(23, 23, 23, 0.02)' }}>
            <div className="f-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>VISUAL MATERIAL THREAD</div>
            <div style={{ margin: '2rem 0', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCategoryHint === 'ewaste-laptop' && <EWasteDevice width={130} />}
              {activeCategoryHint === 'ewaste-phone' && <EWasteDevice width={100} />}
              {activeCategoryHint === 'hazardous-battery' && <HazardousBattery width={95} />}
              {activeCategoryHint === 'paper' && <CardboardPackage width={120} />}
              {activeCategoryHint !== 'ewaste-laptop' && activeCategoryHint !== 'ewaste-phone' && activeCategoryHint !== 'hazardous-battery' && activeCategoryHint !== 'paper' && (
                <PETBottle width={120} />
              )}
            </div>
            <div className="f-display" style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>
              {analysis?.material || 'Transparent PET Plastic Bottle'}
            </div>
            <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              DIGITAL PASSPORT ANCHOR
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PASSPORTS ── */}
      {tab === 'passports' && (
        <div>
          <h3 className="f-display mb-4" style={{ fontSize: '2rem' }}>YOUR MATERIAL PASSPORTS</h3>
          {myPassports.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
              <div className="f-display mb-2" style={{ opacity: 0.3, fontSize: '1.5rem' }}>NO REGISTERED PASSPORTS</div>
              <button className="btn btn-dark mt-4" onClick={() => setTab('identify')}>IDENTIFY YOUR FIRST MATERIAL →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myPassports.map((p) => (
                <div key={p.id} style={{ border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div className="f-display" style={{ fontSize: '1.5rem' }}>{p.id}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                      {p.material} · {p.weight}g · Pathway: <b>{p.pathway}</b>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="badge badge-green">{p.status.toUpperCase()}</span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.55rem' }}
                      onClick={() => { setActivePassportId(p.id); setTab('journey'); }}
                    >
                      WHERE DID IT GO? →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: WHERE DID MY WASTE GO? ── */}
      {tab === 'journey' && (
        <WhereDidItGoJourney passport={currentPassport || passports[0]} onBack={() => setTab('identify')} />
      )}

      {/* ── TAB 4: POP SCORE ── */}
      {tab === 'pop' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <div>
            <div className="f-label mb-2" style={{ color: 'var(--muted)' }}>PROOF OF PARTICIPATION</div>
            <div className="f-display mb-2" style={{ fontSize: 'clamp(4rem, 8vw, 6.5rem)', color: 'var(--accent)', lineHeight: 1 }}>
              {pop}
            </div>
            <div className="f-label mb-6" style={{ color: 'var(--muted)' }}>VERIFIED ENVIRONMENTAL ACTIONS: 47 · 18.4 KG DIVERTED</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              POP is not a speculative token or cryptocurrency. It is a certified participation metric backing extended producer responsibility (EPR) credits and transparent environmental compliance.
            </p>
          </div>
          <div>
            <div className="f-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>VERIFIED ACTIVITY LEDGER</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {popHistory.slice(0, 6).map((e) => (
                <div key={e.id} style={{ border: '1px solid var(--border)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.reason}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                      {e.timestamp.toLocaleDateString()} {e.passportId && `· ${e.passportId}`}
                    </div>
                  </div>
                  <span className="f-display" style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>+{e.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════════════════════
   2. "WHERE DID MY WASTE GO?" ANIMATED RECONSTRUCTION
═════════════════════════════════════════════════════════════════════════════ */
const JOURNEY_MILESTONES = [
  { key: 'identified', label: '1. HOUSEHOLD IDENTIFIED', loc: 'Kothrud, Pune', actor: 'H-018 (Priya Sharma)', time: '10:15 AM' },
  { key: 'collected', label: '2. VERIFIED PICKUP', loc: 'Kothrud Area', actor: 'C-0217 (Ramesh Kumar)', time: '02:40 PM' },
  { key: 'sorted', label: '3. FACILITY SEGREGATION', loc: 'Warje Sorting Hub', actor: 'Warje Operator', time: '04:15 PM' },
  { key: 'transferred', label: '4. LOGISTICS TRANSFER', loc: 'Warje → Hadapsar', actor: 'EcoLogistics Partner', time: '06:00 PM' },
  { key: 'received', label: '5. RECYCLER INTAKE', loc: 'Hadapsar Recycling Plant', actor: 'R-008 EcoCycle Pvt.', time: '08:30 PM' },
  { key: 'processed', label: '6. CIRCULAR REPROCESSING', loc: 'rPET Pelletizing Line', actor: 'R-008 EcoCycle Pvt.', time: 'Next Day 09:00 AM' },
]

function WhereDidItGoJourney({ passport, onBack }: { passport?: MaterialPassport; onBack: () => void }) {
  const [activeStepIdx, setActiveStepIdx] = useState(-1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [bottleX, setBottleX] = useState(0)
  const { awardPOP, addBlockchainEvent, updatePassport } = useStore()
  const hasTriggered = useRef(false)

  const pid = passport?.id || 'MP-10482'

  const runAnimation = () => {
    setActiveStepIdx(-1)
    setIsCompleted(false)
    let idx = 0
    const iv = setInterval(() => {
      setActiveStepIdx(idx)
      setBottleX((idx / (JOURNEY_MILESTONES.length - 1)) * 40 - 20)
      idx++
      if (idx >= JOURNEY_MILESTONES.length) {
        clearInterval(iv)
        setIsCompleted(true)
        if (!hasTriggered.current) {
          hasTriggered.current = true
          awardPOP(20, 'Verified circular recycling complete', pid)
          addBlockchainEvent(`MaterialProcessed(${pid}) on Polygon`)
          if (passport) updatePassport(pid, { status: 'processed', pop_awarded: 20 })
        }
      }
    }, 600)
  }

  useEffect(() => {
    runAnimation()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="f-label" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>PHYSICAL MATERIAL RECONSTRUCTION</div>
          <h3 className="f-display" style={{ fontSize: '2.5rem' }}>WHERE DID MY WASTE GO?</h3>
        </div>
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.55rem' }} onClick={runAnimation}>
          ↻ REPLAY JOURNEY
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {JOURNEY_MILESTONES.map((m, i) => {
            const isVisible = i <= activeStepIdx
            const isActive = i === activeStepIdx
            return (
              <div key={m.key} style={{ display: 'flex', gap: '1.25rem', position: 'relative', paddingBottom: '1.75rem' }}>
                {i < JOURNEY_MILESTONES.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: 24,
                      width: 2,
                      height: '100%',
                      background: isVisible ? 'var(--secondary)' : 'var(--border)',
                      transition: 'background 0.4s ease',
                    }}
                  />
                )}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: isActive ? 'var(--accent)' : isVisible ? 'var(--secondary)' : 'transparent',
                    border: !isVisible ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isVisible && !isActive && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                </div>
                <div style={{ opacity: isVisible ? 1 : 0.25, transition: 'opacity 0.4s ease' }}>
                  <div className="f-display" style={{ fontSize: '1.2rem', color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                    {m.actor} · 📍 {m.loc} · {m.time}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dynamic Bottle & Verified Completion Card */}
        <div style={{ textAlign: 'center', border: '1px solid var(--border)', padding: '2rem', background: 'rgba(23, 23, 23, 0.02)' }}>
          <div style={{ transform: `translateX(${bottleX}px) rotate(${bottleX * 1.2}deg)`, transition: 'transform 0.5s ease', margin: '1rem auto 2rem' }}>
            <PETBottle width={110} crushed={activeStepIdx >= 2 && activeStepIdx <= 4} />
          </div>

          {isCompleted && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', animation: 'fadeUp 0.5s ease' }}>
              <div className="f-label mb-1" style={{ color: 'var(--secondary)' }}>✓ RECYCLING CONFIRMED · ZERO LANDFILL</div>
              <div className="f-display mb-2" style={{ fontSize: '1.8rem' }}>+20 POP CREDITED</div>
              <div className="chain-log" style={{ textAlign: 'left', marginTop: '1rem' }}>
                <span className="ok">✓ Polygon Block #45829102 Verified</span><br />
                <span>Passport ID: {pid}</span><br />
                <span>Processed at EcoCycle Pvt. Ltd. (R-008)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════════════════════
   3. COLLECTOR WORKSPACE (DIGITAL WORKER IDENTITY & SCANNER)
═════════════════════════════════════════════════════════════════════════════ */
function CollectorWorkspace() {
  const [cTab, setCTab] = useState<'id' | 'requests' | 'scan'>('id')
  const [scannedId, setScannedId] = useState('MP-10482')
  const [weight, setWeight] = useState('42.8')
  const [isDone, setIsDone] = useState(false)
  const { passports, updatePassport, addBlockchainEvent, awardPOP } = useStore()

  const handleConfirmHandover = async () => {
    await new Promise((r) => setTimeout(r, 1200))
    const tx = await recordBlockchainEvent(`CollectorHandover(${scannedId},C-0217,${weight}g)`)
    addBlockchainEvent(`CollectorHandover(${scannedId},C-0217,${weight}g) — Polygon Verified`)
    updatePassport(scannedId, {
      status: 'collected',
      weight: parseFloat(weight),
    })
    awardPOP(5, 'Collector handover completed', scannedId)
    setIsDone(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        {[
          { id: 'id' as const, label: 'DIGITAL WORKER ID' },
          { id: 'requests' as const, label: 'AVAILABLE PICKUP REQUESTS' },
          { id: 'scan' as const, label: 'PASSPORT SCANNER & LOG' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setCTab(t.id)}
            className="btn btn-outline"
            style={{
              borderColor: cTab === t.id ? 'var(--text)' : 'var(--border)',
              background: cTab === t.id ? 'var(--text)' : 'transparent',
              color: cTab === t.id ? 'var(--bg)' : 'var(--text)',
              padding: '0.5rem 1rem',
              fontSize: '0.55rem',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {cTab === 'id' && (
        <div style={{ maxWidth: 460 }}>
          <div className="id-card">
            <div className="id-card-stripe" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <div className="f-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>FORMAL WASTE WORKER CREDENTIAL</div>
              <span className="badge badge-green">✓ VERIFIED</span>
            </div>
            <div className="f-display" style={{ fontSize: '2.5rem', letterSpacing: '0.04em' }}>C-0217</div>
            <div className="f-display" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ramesh Kumar</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              <div><b>Operating Area:</b> Kothrud, Pune</div>
              <div><b>Experience:</b> 6 Years Formalized</div>
              <div><b>Recovered Total:</b> 1,284 KG</div>
              <div><b>Service Rating:</b> ★ 4.9 (247 Jobs)</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['PET Clear', 'HDPE', 'E-Waste Certified', 'Cardboard', 'Metal'].map((m) => (
                <span key={m} className="f-label" style={{ padding: '0.2rem 0.5rem', border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.55rem' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {cTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { id: 'REQ-101', item: 'PET Bottles (approx. 42.8g)', loc: 'Kothrud, Lane 4 (0.8 km)', from: 'H-018 Priya Sharma' },
            { id: 'REQ-102', item: 'E-Waste Laptop Battery', loc: 'Karve Road (1.4 km)', from: 'PCCoE Campus' },
          ].map((req) => (
            <div key={req.id} style={{ border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="f-display" style={{ fontSize: '1.3rem' }}>{req.item}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>📍 {req.loc} · Generator: {req.from}</div>
              </div>
              <button className="btn btn-dark" style={{ padding: '0.5rem 1rem', fontSize: '0.55rem' }} onClick={() => setCTab('scan')}>
                ACCEPT & SCAN →
              </button>
            </div>
          ))}
        </div>
      )}

      {cTab === 'scan' && (
        <div style={{ maxWidth: 520 }}>
          <h3 className="f-display mb-2" style={{ fontSize: '2rem' }}>PASSPORT SCANNER</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Scan the QR code on the physical waste or enter the Material Passport ID to record verified weight.
          </p>
          {!isDone ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="f-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>MATERIAL PASSPORT ID</div>
                <input
                  type="text"
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <div className="f-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>VERIFIED SCALED WEIGHT (GRAMS)</div>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg)', fontWeight: 700, fontSize: '1.2rem' }}
                />
              </div>
              <button className="btn btn-dark" style={{ padding: '1rem', justifyContent: 'center' }} onClick={handleConfirmHandover}>
                LOG VERIFIED HANDOVER ON BLOCKCHAIN →
              </button>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--secondary)', padding: '1.5rem', background: 'rgba(104, 112, 90, 0.05)' }}>
              <div className="f-label mb-1" style={{ color: 'var(--secondary)' }}>✓ HANDOVER RECORDED</div>
              <div className="f-display mb-2" style={{ fontSize: '1.8rem' }}>COLLECTION CONFIRMED</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {weight}g successfully recorded for {scannedId}. Material transferred to sorting stage.
              </p>
              <button className="btn btn-outline mt-3" style={{ fontSize: '0.55rem' }} onClick={() => setIsDone(false)}>
                SCAN NEXT ITEM
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════════════════════
   4. COMPANY / INSTITUTION WORKSPACE (CAMPUS E-WASTE & COMPLIANCE)
═════════════════════════════════════════════════════════════════════════════ */
function CompanyWorkspace() {
  return (
    <div>
      <div className="f-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>INSTITUTIONAL PORTAL</div>
      <h2 className="f-display mb-6" style={{ fontSize: '2.5rem' }}>PIMPRI CHINCHWAD COLLEGE OF ENGINEERING (PCCOE)</h2>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { l: 'TOTAL TRACED', v: '42.8 KG' },
          { l: 'RECYCLABLE DIVERTED', v: '31.4 KG' },
          { l: 'E-WASTE ROUTED', v: '4.2 KG' },
          { l: 'COMPLIANCE SCORE', v: '100%' },
        ].map((s) => (
          <div key={s.l} style={{ border: '1px solid var(--border)', padding: '1.25rem', background: 'rgba(23, 23, 23, 0.02)' }}>
            <div className="f-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{s.l}</div>
            <div className="f-display" style={{ fontSize: '2rem' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Dedicated E-Waste Inventory */}
      <div className="f-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>CAMPUS E-WASTE & HAZARDOUS AUDIT</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          { dev: 'Computer Lab: 12 Non-Functional Monitored Motherboards', cat: 'E-Waste Recovery', stat: 'Authorized E-Waste Recycler Scheduled' },
          { dev: 'Robotics Wing: 6 Swollen Li-Po Battery Packs', cat: 'Hazardous Chemical', stat: 'Specialized HazMat Disposal Dispatched' },
          { dev: 'Library: 40 KG Discarded Journals & Paper', cat: 'Hydro-Pulping', stat: 'Sorted & Transferred' },
        ].map((item) => (
          <div key={item.dev} style={{ border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.dev}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{item.cat}</div>
            </div>
            <span className="badge badge-green">{item.stat}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-dark">
        DOWNLOAD CPCB & SPCB AUDIT REPORT (PDF) →
      </button>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════════════════════
   5. RECYCLER WORKSPACE (INCOMING INTAKE & PROCESSING)
═════════════════════════════════════════════════════════════════════════════ */
function RecyclerWorkspace() {
  const [processedIds, setProcessedIds] = useState<string[]>([])
  const { passports, updatePassport, awardPOP, addBlockchainEvent } = useStore()

  const handleProcess = async (pid: string) => {
    await new Promise((r) => setTimeout(r, 1000))
    const tx = await recordBlockchainEvent(`RecyclerProcessed(${pid},R-008)`)
    addBlockchainEvent(`RecyclerProcessed(${pid}) — EcoCycle Pvt. Ltd. Verified`)
    updatePassport(pid, { status: 'processed', recyclerId: 'R-008', pop_awarded: 20 })
    awardPOP(20, 'Verified factory recycling processing', pid)
    setProcessedIds((prev) => [...prev, pid])
  }

  return (
    <div>
      <div className="f-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>CERTIFIED REPROCESSING FACILITY</div>
      <h2 className="f-display mb-1" style={{ fontSize: '2.5rem' }}>{DEMO_RECYCLER.name}</h2>
      <div className="f-label mb-6" style={{ color: 'var(--muted)' }}>
        FACILITY: {DEMO_RECYCLER.area} · DAILY CAPACITY: {DEMO_RECYCLER.capacity}
      </div>

      <div className="f-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.55rem' }}>INCOMING MATERIAL STREAM QUEUE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { id: 'MP-10481', mat: 'Clear PET Bottles (42.8g)', src: 'H-018 Kothrud via C-0217' },
          { id: 'MP-10480', mat: 'HDPE Flakes (18.2 KG)', src: 'PCCoE Campus via C-0217' },
        ].map((item) => (
          <div key={item.id} style={{ border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="f-display" style={{ fontSize: '1.3rem' }}>{item.id} · {item.mat}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>Origin: {item.src}</div>
            </div>
            {processedIds.includes(item.id) ? (
              <span className="badge badge-green">✓ REPROCESSED & ANCHORED</span>
            ) : (
              <button className="btn btn-accent" style={{ padding: '0.5rem 1rem', fontSize: '0.55rem' }} onClick={() => handleProcess(item.id)}>
                CONFIRM REPROCESSING →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
