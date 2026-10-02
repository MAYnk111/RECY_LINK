// Company/Institution Dashboard
import React, { useState } from 'react'
import { useStore } from '../store'

type CompanyTab = 'overview' | 'waste' | 'ewaste' | 'passports' | 'reports'

export function CompanyDashboard() {
  const { passports, addPassport, setAnalysis, setView, awardPOP, addBlockchainEvent } = useStore()
  const [tab, setTab] = useState<CompanyTab>('overview')
  const [schedulingCollection, setSchedulingCollection] = useState(false)
  const [scheduled, setScheduled] = useState(false)
  
  const TABS: { id: CompanyTab; label: string }[] = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'waste', label: 'WASTE UPLOAD' },
    { id: 'ewaste', label: 'E-WASTE' },
    { id: 'passports', label: 'MATERIAL PASSPORTS' },
    { id: 'reports', label: 'REPORTS' },
  ]
  
  const companyPassports = passports.filter(p => p.sourceId === 'PCCoE')
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '2rem 4vw 0' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="font-label mb-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              INSTITUTION · PCCoE CAMPUS
            </div>
            <div className="font-display text-3xl">Pimpri Chinchwad College of Engineering</div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>TOTAL WASTE</div>
              <div className="font-display text-2xl">42.8 KG</div>
            </div>
            <div className="text-right">
              <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>RECYCLABLE</div>
              <div className="font-display text-2xl" style={{ color: 'var(--secondary)' }}>31.4 KG</div>
            </div>
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
        
        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <div className="grid md:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'TOTAL WASTE', value: '42.8 KG', color: false },
                { label: 'RECYCLABLE', value: '31.4 KG', color: true },
                { label: 'E-WASTE', value: '4.2 KG', accent: true },
                { label: 'COLLECTIONS', value: '12' },
              ].map(s => (
                <div key={s.label} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{s.label}</div>
                  <div className="font-display text-4xl" style={{ color: s.color ? 'var(--secondary)' : s.accent ? 'var(--accent)' : 'var(--text)' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Locations */}
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>WASTE-GENERATING LOCATIONS</div>
            <div className="space-y-3 mb-10">
              {[
                { name: 'Main Campus Block A', waste: '18.2 KG', type: 'Mixed', collections: 5 },
                { name: 'Cafeteria & Common Areas', waste: '12.4 KG', type: 'Plastic, Paper', collections: 4 },
                { name: 'Computer Lab', waste: '8.2 KG', type: 'E-Waste, Plastic', collections: 2 },
                { name: 'Library', waste: '4.0 KG', type: 'Paper, Cardboard', collections: 1 },
              ].map(loc => (
                <div key={loc.name} className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{loc.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{loc.type}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-display text-xl">{loc.waste}</div>
                      <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>TOTAL</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl">{loc.collections}</div>
                      <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>COLLECTIONS</div>
                    </div>
                    <button className="btn-ghost text-xs py-2 px-4">REQUEST →</button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => setTab('waste')} className="btn-primary justify-center py-4">
                UPLOAD WASTE PHOTO
              </button>
              <button
                onClick={() => {
                  setSchedulingCollection(true)
                  setTimeout(() => { setSchedulingCollection(false); setScheduled(true) }, 1500)
                }}
                className="btn-ghost justify-center py-4"
              >
                {schedulingCollection ? 'SCHEDULING...' : scheduled ? '✓ SCHEDULED' : 'SCHEDULE BULK COLLECTION'}
              </button>
              <button onClick={() => setTab('ewaste')} className="btn-ghost justify-center py-4">
                REPORT E-WASTE
              </button>
            </div>
          </div>
        )}
        
        {/* ── WASTE UPLOAD ── */}
        {tab === 'waste' && (
          <div style={{ maxWidth: 600 }}>
            <h2 className="font-display text-4xl mb-2">UPLOAD WASTE</h2>
            <p className="mb-8" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
              Upload waste photos for AI identification and bulk collection request.
            </p>
            
            <div className="space-y-6">
              {/* Category declaration */}
              <div>
                <div className="font-label mb-3" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>DECLARE WASTE CATEGORIES</div>
                <div className="grid grid-cols-2 gap-3">
                  {['PET Plastic', 'Paper/Cardboard', 'Metal', 'Glass', 'E-Waste', 'Mixed/Other'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 p-3" style={{ border: '1px solid var(--border)', cursor: 'none' }}>
                      <input type="checkbox" defaultChecked={cat === 'PET Plastic'} style={{ cursor: 'none' }} />
                      <span style={{ fontSize: '0.8rem' }}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Upload area */}
              <div
                className="border-2 border-dashed p-10 text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>📦</div>
                <div className="font-display text-2xl mb-2">UPLOAD BATCH PHOTOS</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
                  Multiple images supported
                </p>
                <button className="btn-primary px-8 py-3">BROWSE FILES</button>
              </div>
              
              {/* Weight */}
              <div>
                <div className="font-label mb-2" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>ESTIMATED TOTAL WEIGHT (KG)</div>
                <input
                  type="number"
                  defaultValue="18.2"
                  className="w-full px-4 py-3"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '1.2rem', fontWeight: 700, outline: 'none' }}
                />
              </div>
              
              {/* Location */}
              <div>
                <div className="font-label mb-2" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>PICKUP LOCATION</div>
                <select
                  className="w-full px-4 py-3"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', outline: 'none', cursor: 'none' }}
                >
                  <option>Main Campus Block A</option>
                  <option>Cafeteria & Common Areas</option>
                  <option>Computer Lab</option>
                  <option>Library</option>
                </select>
              </div>
              
              <button className="btn-accent w-full justify-center py-4">
                REQUEST BULK COLLECTION →
              </button>
            </div>
          </div>
        )}
        
        {/* ── E-WASTE ── */}
        {tab === 'ewaste' && (
          <div style={{ maxWidth: 700 }}>
            <h2 className="font-display text-4xl mb-2">E-WASTE MANAGEMENT</h2>
            <p className="mb-8" style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.7 }}>
              E-waste requires specialized handling. RECY-LINK routes e-waste to authorized processors only.
            </p>
            
            {/* E-waste inventory */}
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>CURRENT E-WASTE INVENTORY</div>
            <div className="space-y-3 mb-8">
              {[
                { device: 'Laptop (Dell)', qty: 3, status: 'Awaiting Collection', hazardous: 'Battery: Li-ion', pathway: 'E-Waste Recycler' },
                { device: 'CRT Monitor', qty: 2, status: 'Collection Scheduled', hazardous: 'Lead glass, CRT', pathway: 'Specialized Handling' },
                { device: 'Mobile Phones', qty: 8, status: 'Identified', hazardous: 'Battery: Li-ion', pathway: 'Refurbishment / E-Waste' },
                { device: 'Printer Cartridges', qty: 12, status: 'Collected', hazardous: 'Ink: Mild', pathway: 'Material Recovery' },
              ].map(item => (
                <div key={item.device} style={{ border: '1px solid var(--border)', padding: '1rem 1.5rem' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.device} × {item.qty}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>
                        ⚠ {item.hazardous} · Pathway: {item.pathway}
                      </div>
                    </div>
                    <span
                      className="font-label text-xs px-3 py-1"
                      style={{
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        fontSize: '0.55rem',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add new e-waste */}
            <div className="p-6" style={{ border: '2px solid var(--accent)', background: 'rgba(126,38,50,0.03)' }}>
              <div className="font-label mb-4" style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>
                REPORT NEW E-WASTE ITEM
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>DEVICE TYPE</div>
                  <select className="w-full px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', cursor: 'none' }}>
                    <option>Laptop / Desktop</option>
                    <option>Mobile / Tablet</option>
                    <option>Monitor / Display</option>
                    <option>Printer / Copier</option>
                    <option>Battery</option>
                    <option>Other Electronic</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>CONDITION</div>
                    <select className="w-full px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none', cursor: 'none' }}>
                      <option>Working</option>
                      <option>Partially Working</option>
                      <option>Non-Functional</option>
                      <option>Broken / Damaged</option>
                    </select>
                  </div>
                  <div>
                    <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>QUANTITY</div>
                    <input type="number" defaultValue="1" className="w-full px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none' }} />
                  </div>
                  <div>
                    <div className="font-label mb-2" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>WEIGHT (KG)</div>
                    <input type="number" defaultValue="2.1" className="w-full px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--bg)', outline: 'none' }} />
                  </div>
                </div>
                
                <div
                  className="p-4"
                  style={{ background: 'rgba(126,38,50,0.05)', border: '1px solid rgba(126,38,50,0.2)' }}
                >
                  <div className="font-label mb-1" style={{ fontSize: '0.55rem', color: 'var(--accent)' }}>⚠ E-WASTE NOTE</div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    E-waste will be routed to PCB-authorized recyclers only. Do not mix with general waste stream.
                    Data destruction certificate available on request.
                  </p>
                </div>
                
                <button className="btn-accent w-full justify-center py-4">
                  SUBMIT E-WASTE REPORT →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ── PASSPORTS ── */}
        {tab === 'passports' && (
          <div>
            <h2 className="font-display text-4xl mb-8">MATERIAL PASSPORTS</h2>
            <div className="space-y-3">
              {[
                { id: 'MP-10480', material: 'PET Plastic', weight: '18.2 KG', status: 'processed', recycler: 'R-008', date: '3 days ago' },
                { id: 'MP-10474', material: 'Paper/Cardboard', weight: '8.4 KG', status: 'received', recycler: 'R-015', date: '1 week ago' },
                { id: 'MP-10467', material: 'E-Waste Batch', weight: '4.2 KG', status: 'sorted', recycler: 'R-022', date: '2 weeks ago' },
              ].map(p => (
                <div key={p.id} className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-display text-xl">{p.id}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.material} · {p.weight} · {p.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="font-label text-xs px-3 py-1"
                      style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.55rem' }}
                    >
                      {p.status.toUpperCase()}
                    </span>
                    <button className="btn-ghost text-xs py-1 px-3">TRACE →</button>
                  </div>
                </div>
              ))}
              
              {companyPassports.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-display text-xl">{p.id}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{p.material} · {p.weight}g</div>
                  </div>
                  <span
                    className="font-label text-xs px-3 py-1"
                    style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.55rem' }}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* ── REPORTS ── */}
        {tab === 'reports' && (
          <div>
            <h2 className="font-display text-4xl mb-8">RECYCLING REPORTS</h2>
            
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { label: 'THIS MONTH', value: '12.4 KG', sub: 'Material diverted' },
                { label: 'THIS QUARTER', value: '42.8 KG', sub: 'Total tracked' },
                { label: 'CO₂ EQUIVALENT', value: '38.6 KG', sub: 'Emissions avoided' },
              ].map(s => (
                <div key={s.label} style={{ border: '1px solid var(--border)', padding: '1.5rem' }}>
                  <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{s.label}</div>
                  <div className="font-display text-4xl mb-1">{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            
            {/* Compliance */}
            <div className="font-label mb-4" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>COMPLIANCE STATUS</div>
            <div className="space-y-3 mb-8">
              {[
                { rule: 'PCB E-Waste Rules 2022', status: 'Compliant', detail: 'All e-waste routed to authorized recyclers' },
                { rule: 'Plastic Waste Management 2021', status: 'Compliant', detail: 'Extended Producer Responsibility tracked' },
                { rule: 'Municipal Solid Waste Rules', status: 'Compliant', detail: 'Segregation at source verified' },
              ].map(c => (
                <div key={c.rule} className="flex justify-between items-center p-4" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.rule}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{c.detail}</div>
                  </div>
                  <span
                    className="font-label px-3 py-1"
                    style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.6rem' }}
                  >
                    ✓ {c.status}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="btn-primary px-8 py-3">
              DOWNLOAD VERIFIED RECYCLING REPORT →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
