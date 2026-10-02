// LandingPage — cinematic scroll-driven experience
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PETBottle } from './PETBottle'
import { useStore } from '../store'

gsap.registerPlugin(ScrollTrigger)

// Animated text reveal
function RevealText({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' }
      }
    )
  }, [delay])
  return <div ref={ref} className={className}>{children}</div>
}

// Micro-label
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="section-label inline-block mb-4">{children}</span>
  )
}

// Stat display
function Stat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%' }
      }
    )
  }, [])
  return (
    <div ref={ref} className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
      <div className="font-display text-5xl mb-1" style={{ color: 'var(--accent)' }}>{value}</div>
      <div className="font-label text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
    </div>
  )
}

export function LandingPage() {
  const { setView } = useStore()
  const heroRef = useRef<HTMLDivElement>(null)
  const bottleRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const pinnedBottleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ─── HERO ─────────────────────────────────────────────────────────
      // Bottle starts diagonal (rotated), then straightens + moves toward center
      gsap.set(bottleRef.current, { rotate: -20, x: 80, scale: 1.15 })
      
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress
          if (bottleRef.current) {
            gsap.set(bottleRef.current, {
              rotate: -20 + p * 20,
              x: 80 - p * 100,
              y: p * -40,
              scale: 1.15 - p * 0.15,
              opacity: 1 - p * 0.3,
            })
          }
          if (heroTextRef.current) {
            gsap.set(heroTextRef.current, {
              y: p * -60,
              opacity: 1 - p * 1.5,
            })
          }
        }
      })

      // Hero headline character animation
      gsap.fromTo('.hero-line-1', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'power4.out', delay: 0.2 })
      gsap.fromTo('.hero-line-2', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'power4.out', delay: 0.4 })
      gsap.fromTo('.hero-line-3', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'power4.out', delay: 0.6 })
      gsap.fromTo('.hero-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.5 })
      gsap.fromTo('.hero-counter', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.2 })
      
      // ─── PINNED BOTTLE JOURNEY ─────────────────────────────────────────
      // Bottle stays pinned while text sequences through the journey
      if (pinnedBottleRef.current) {
        ScrollTrigger.create({
          trigger: '#journey-section',
          start: 'top top',
          end: '+=600%',
          pin: pinnedBottleRef.current,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress
            if (pinnedBottleRef.current) {
              const bottle = pinnedBottleRef.current.querySelector('.pinned-bottle') as HTMLElement
              if (bottle) {
                gsap.set(bottle, {
                  rotate: p * 360,
                  scale: 0.8 + Math.sin(p * Math.PI) * 0.4,
                  x: Math.sin(p * Math.PI * 2) * 30,
                })
              }
            }
          }
        })
      }
      
    }, heroRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <main>
      {/* ══════════════════════════════════════════════════════════════
          SECTION 01 — HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="hero"
        className="relative overflow-hidden"
        style={{ height: '100vh', minHeight: 700, background: 'var(--bg)' }}
      >
        {/* Background typography — massive, behind bottle */}
        <div
          className="absolute inset-0 flex flex-col justify-center pointer-events-none select-none"
          style={{ paddingLeft: '6vw', paddingRight: '6vw', zIndex: 1 }}
        >
          <div className="hero-line-1 font-display text-[18vw] leading-none" style={{ color: 'var(--text)', opacity: 0 }}>
            EVERY
          </div>
          <div className="hero-line-2 font-display text-[18vw] leading-none" style={{ color: 'var(--text)', opacity: 0 }}>
            BOTTLE
          </div>
          <div className="hero-line-3 font-display text-[18vw] leading-none" style={{ color: 'var(--accent)', opacity: 0 }}>
            HAS A JOURNEY.
          </div>
        </div>
        
        {/* Bottle — positioned diagonally, on top of text */}
        <div
          ref={bottleRef}
          className="absolute"
          style={{
            zIndex: 3,
            right: '20%',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <PETBottle width={220} crushed={false} />
        </div>
        
        {/* Bottom metadata */}
        <div
          ref={heroTextRef}
          className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-8 pb-8"
          style={{ zIndex: 4 }}
        >
          <div className="hero-scroll-hint flex items-center gap-3" style={{ opacity: 0 }}>
            <div style={{ width: 1, height: 40, background: 'var(--text)', opacity: 0.4 }} />
            <span className="font-label" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
              SCROLL TO TRACE
            </span>
          </div>
          
          <div className="hero-counter" style={{ opacity: 0, textAlign: 'right' }}>
            <div className="font-label" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              DIGITAL RECYCLING INFRASTRUCTURE
            </div>
            <div className="font-display text-sm mt-1" style={{ color: 'var(--accent)' }}>01 / 10</div>
          </div>
        </div>
        
        {/* Subtle left vertical text */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2"
          style={{ zIndex: 2, writingMode: 'vertical-rl', letterSpacing: '0.3em' }}
        >
          <span className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)', opacity: 0.6 }}>
            GIVING EVERY MATERIAL A TRACEABLE JOURNEY
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 02 — THE PROBLEM
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="problem"
        style={{ background: 'var(--text)', color: 'var(--bg)', minHeight: '100vh', padding: '15vh 8vw' }}
        className="relative overflow-hidden"
      >
        <Label>02 / THE PROBLEM</Label>
        
        <RevealText>
          <h2
            className="font-display"
            style={{ fontSize: 'clamp(3rem, 10vw, 9rem)', lineHeight: 0.9, marginBottom: '2rem' }}
          >
            WE THROW IT AWAY.
            <span style={{ display: 'block', color: 'rgba(242,239,231,0.4)' }}>SOMEONE ELSE</span>
            <span style={{ display: 'block' }}>HAS TO FIND IT.</span>
          </h2>
        </RevealText>
        
        <RevealText delay={0.2}>
          <p style={{ maxWidth: 560, lineHeight: 1.8, opacity: 0.7, marginBottom: '5rem', fontSize: '1rem' }}>
            The recycling value chain is broken at every handoff. Households discard. Collectors search. Sorters receive mixed streams. Recyclers struggle for consistent material. No one knows where anything went.
          </p>
        </RevealText>
        
        {/* Disconnected nodes */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ border: '1px solid rgba(242,239,231,0.1)', marginBottom: '6rem' }}>
          {[
            { id: 'H', label: 'HOUSEHOLD', sub: 'Discards without traceability' },
            { id: '×', label: '', sub: '' },
            { id: 'C', label: 'COLLECTOR', sub: 'No digital identity' },
            { id: '×', label: '', sub: '' },
            { id: 'R', label: 'RECYCLER', sub: 'Inconsistent material access' },
          ].map((node, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <div
                className="p-6 text-center"
                style={{
                  background: node.id === '×' ? 'transparent' : 'rgba(242,239,231,0.04)',
                  border: '1px solid rgba(242,239,231,0.08)',
                }}
              >
                {node.id !== '×' ? (
                  <>
                    <div className="font-display text-4xl mb-2" style={{ color: 'rgba(242,239,231,0.2)' }}>{node.id}</div>
                    <div className="font-label text-xs mb-1" style={{ color: 'var(--bg)' }}>{node.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(242,239,231,0.4)', lineHeight: 1.5 }}>{node.sub}</div>
                  </>
                ) : (
                  <div className="font-display text-3xl" style={{ color: 'var(--accent)', lineHeight: '80px' }}>—</div>
                )}
              </div>
            </RevealText>
          ))}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '94%', label: 'OF PET PLASTIC NEVER TRACED' },
            { value: '15M+', label: 'INFORMAL COLLECTORS UNREGISTERED' },
            { value: '60%', label: 'RECYCLABLE WASTE SENT TO LANDFILL' },
            { value: '₹0', label: 'EARNED BY GENERATORS FOR VERIFIED RECYCLING' },
          ].map((s, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <div style={{ borderTop: '1px solid rgba(242,239,231,0.15)', paddingTop: '1.5rem' }}>
                <div className="font-display text-5xl mb-1" style={{ color: 'var(--accent)' }}>{s.value}</div>
                <div className="font-label" style={{ color: 'rgba(242,239,231,0.5)', fontSize: '0.6rem' }}>{s.label}</div>
              </div>
            </RevealText>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 03 — THE SYSTEM
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="system"
        style={{ background: 'var(--bg)', minHeight: '100vh', padding: '15vh 8vw' }}
      >
        <Label>03 / THE SYSTEM</Label>
        
        <RevealText>
          <h2
            className="font-display mb-16"
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', lineHeight: 0.92 }}
          >
            ONE MATERIAL.
            <span style={{ display: 'block', color: 'var(--accent)' }}>ONE DIGITAL ID.</span>
            <span style={{ display: 'block' }}>ONE ECOSYSTEM.</span>
          </h2>
        </RevealText>
        
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <RevealText>
              <p style={{ lineHeight: 1.8, opacity: 0.7, marginBottom: '3rem', maxWidth: 460 }}>
                RECY-LINK formally integrates every actor in the recycling value chain into one traceable digital infrastructure. From the moment you photograph waste — to verified processing.
              </p>
            </RevealText>
            
            {/* Loop diagram */}
            <div className="space-y-0">
              {['IDENTIFY', 'MATCH', 'COLLECT', 'TRACE', 'PROCESS', 'VERIFY', 'REWARD'].map((step, i) => (
                <RevealText key={step} delay={i * 0.06}>
                  <div
                    className="flex items-center gap-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="font-label" style={{ color: 'var(--muted)', fontSize: '0.6rem', width: 20 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-xl">{step}</span>
                    {i < 6 && (
                      <div style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '0.8rem' }}>↓</div>
                    )}
                  </div>
                </RevealText>
              ))}
            </div>
          </div>
          
          {/* Bottle with data overlay */}
          <RevealText delay={0.3}>
            <div className="relative flex justify-center">
              <PETBottle width={180} animated />
              {/* Data callouts */}
              <div
                className="absolute top-16 right-0 card-editorial"
                style={{ maxWidth: 200, right: -20 }}
              >
                <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>MATERIAL PASSPORT</div>
                <div className="font-display text-xl mb-1">MP-10482</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>✓ BLOCKCHAIN VERIFIED</div>
              </div>
              <div
                className="absolute bottom-24 left-0 card-editorial"
                style={{ maxWidth: 180, left: -20 }}
              >
                <div className="font-label mb-2" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>STATUS</div>
                <div className="font-label text-xs" style={{ color: 'var(--secondary)' }}>✓ PROCESSED</div>
                <div className="font-display text-3xl mt-1" style={{ color: 'var(--accent)' }}>+20</div>
                <div className="font-label" style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>POP EARNED</div>
              </div>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 04 — JOURNEY (PINNED BOTTLE)
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="journey-section"
        style={{ background: 'var(--bg)', position: 'relative', minHeight: '100vh' }}
      >
        <div style={{ padding: '15vh 8vw' }}>
          <Label>04 / THE JOURNEY</Label>
          
          <RevealText>
            <h2 className="font-display mb-8" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 0.92 }}>
              WHERE DID<br /><span style={{ color: 'var(--accent)' }}>IT GO?</span>
            </h2>
          </RevealText>
          
          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div>
              {[
                { step: 'DISCARDED', icon: '◉', desc: 'Household identifies material via RECY-LINK app', status: 'done' },
                { step: 'IDENTIFIED', icon: '◉', desc: 'AI analyzes material, condition, and best pathway', status: 'done' },
                { step: 'COLLECTED', icon: '◉', desc: 'Verified collector assigned and confirmed pickup', status: 'done' },
                { step: 'SORTED', icon: '◉', desc: 'Material sorted at facility, weight confirmed', status: 'done' },
                { step: 'MATCHED', icon: '◉', desc: 'Best recycler matched based on material and capacity', status: 'done' },
                { step: 'TRANSFERRED', icon: '◉', desc: 'Blockchain-backed handover to recycler', status: 'done' },
                { step: 'RECYCLED', icon: '◉', desc: 'Processing confirmed. POP awarded.', status: 'done' },
                { step: 'VERIFIED', icon: '◉', desc: 'Tamper-evident record on Polygon blockchain', status: 'done' },
              ].map((item, i) => (
                <RevealText key={item.step} delay={i * 0.05}>
                  <div className="timeline-item mb-6 relative">
                    {i < 7 && <div className="timeline-line" />}
                    <div className="timeline-dot done" style={{ background: 'var(--secondary)', marginTop: 3 }} />
                    <div>
                      <div className="font-display text-2xl mb-0.5" style={{ letterSpacing: '0.02em' }}>{item.step}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                </RevealText>
              ))}
            </div>
            
            <RevealText delay={0.4}>
              <div
                ref={pinnedBottleRef}
                className="flex justify-center items-center sticky"
                style={{ top: '20vh', height: '60vh' }}
              >
                <div className="pinned-bottle">
                  <PETBottle width={160} />
                </div>
              </div>
            </RevealText>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 05 — THE PEOPLE (COLLECTORS)
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="collectors"
        style={{ background: '#1a1a18', minHeight: '90vh', padding: '15vh 8vw', color: 'var(--bg)' }}
      >
        <Label>05 / THE PEOPLE WHO MOVE THE MATERIAL</Label>
        
        <RevealText>
          <h2 className="font-display mb-6" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 0.9 }}>
            GIVING EVERY<br />WASTE WORKER<br /><span style={{ color: 'var(--accent)' }}>AN IDENTITY.</span>
          </h2>
        </RevealText>
        
        <RevealText delay={0.2}>
          <p style={{ maxWidth: 520, lineHeight: 1.8, opacity: 0.6, marginBottom: '4rem' }}>
            Over 15 million informal waste collectors in India operate without a digital identity, formal payment, or verifiable work history. RECY-LINK changes this permanently.
          </p>
        </RevealText>
        
        <div className="grid md:grid-cols-3 gap-px" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'C-0217', name: 'Ramesh Kumar', area: 'Kothrud, Pune', materials: 'PET · PAPER · METAL', collections: 247, kg: '1,284 KG' },
            { id: 'C-0182', name: 'Sunita Devi', area: 'Karve Nagar', materials: 'PET · E-WASTE', collections: 189, kg: '892 KG' },
            { id: 'C-0301', name: 'Mohammed Aslam', area: 'Deccan, Pune', materials: 'PET · PAPER · GLASS', collections: 134, kg: '678 KG' },
          ].map((c, i) => (
            <RevealText key={c.id} delay={i * 0.1}>
              <div
                className="p-8"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-label" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>DIGITAL ID</div>
                    <div className="font-display text-2xl">{c.id}</div>
                  </div>
                  <span className="collector-badge">✓ VERIFIED</span>
                </div>
                <div className="font-display text-3xl mb-1">{c.name}</div>
                <div className="font-label mb-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>{c.area}</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <div className="font-label mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem' }}>MATERIALS</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>{c.materials}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-display text-3xl">{c.collections}</div>
                      <div className="font-label" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>COLLECTIONS</div>
                    </div>
                    <div>
                      <div className="font-display text-3xl">{c.kg}</div>
                      <div className="font-label" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>RECOVERED</div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealText>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 06 — WASTE-TO-OPPORTUNITY ENGINE
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{ background: 'var(--bg)', minHeight: '90vh', padding: '15vh 8vw' }}
      >
        <Label>06 / WASTE-TO-OPPORTUNITY ENGINE</Label>
        
        <RevealText>
          <h2 className="font-display mb-8" style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', lineHeight: 0.92 }}>
            DON'T JUST<br />RECYCLE IT.<br /><span style={{ color: 'var(--accent)' }}>FIND ITS NEXT<br />BEST USE.</span>
          </h2>
        </RevealText>
        
        <RevealText delay={0.2}>
          <p style={{ maxWidth: 500, lineHeight: 1.8, opacity: 0.7, marginBottom: '4rem' }}>
            The engine evaluates material, quality, contamination, quantity, and location — then determines the highest-value pathway. Not everything that could be recycled should be.
          </p>
        </RevealText>
        
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { pathway: 'REUSE', desc: 'Direct reuse without processing', color: '#68705A', example: 'Clean glass containers' },
            { pathway: 'REFURBISH', desc: 'Repair and restore to market', color: '#7E2632', example: 'Working electronics' },
            { pathway: 'RECOVER', desc: 'Component or material extraction', color: '#8fa0b8', example: 'Damaged devices' },
            { pathway: 'RECYCLE', desc: 'Material reprocessing', color: '#68705A', example: 'Clean PET plastic' },
            { pathway: 'SPECIALIZED', desc: 'Authorized hazardous handling', color: '#7E2632', example: 'E-waste batteries' },
          ].map((p, i) => (
            <RevealText key={p.pathway} delay={i * 0.08}>
              <div
                className="p-5"
                style={{
                  border: '1px solid var(--border)',
                  borderTop: `3px solid ${p.color}`,
                  height: '100%',
                }}
              >
                <div className="font-display text-xl mb-3" style={{ color: p.color, lineHeight: 1 }}>{p.pathway}</div>
                <div style={{ fontSize: '0.72rem', lineHeight: 1.6, opacity: 0.7, marginBottom: '1rem' }}>{p.desc}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>e.g. {p.example}</div>
              </div>
            </RevealText>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 07 — TRUST / BLOCKCHAIN
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: 'var(--bg)', padding: '15vh 8vw', borderTop: '1px solid var(--border)' }}
      >
        <Label>07 / CAN YOU TRUST THE JOURNEY?</Label>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <RevealText>
            <h2 className="font-display mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.92 }}>
              EVERY HANDOVER.<br /><span style={{ color: 'var(--accent)' }}>TAMPER-EVIDENT.</span><br />FOREVER.
            </h2>
            <p style={{ lineHeight: 1.8, opacity: 0.7, maxWidth: 400, marginBottom: '2rem' }}>
              Critical material events are anchored to the Polygon blockchain. Not names. Not addresses. Just verified events — immutable, timestamped, transparent.
            </p>
            <div className="flex gap-4">
              <div
                className="px-4 py-2 font-label text-xs"
                style={{ border: '1px solid var(--secondary)', color: 'var(--secondary)' }}
              >
                POLYGON NETWORK
              </div>
              <div
                className="px-4 py-2 font-label text-xs"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                SOLIDITY CONTRACTS
              </div>
            </div>
          </RevealText>
          
          <RevealText delay={0.2}>
            <div
              className="p-6"
              style={{ background: '#0d1117', borderRadius: 2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#68705A' }} />
                <span className="blockchain-record">BLOCKCHAIN EVENT LOG</span>
              </div>
              {[
                { event: 'MaterialCreated(MP-10482)', tx: '0xa4f8...2e1d', time: '14:42:08' },
                { event: 'CollectorHandover(C-0217→R-008)', tx: '0xc2e1...9a3b', time: '16:18:22' },
                { event: 'SortingConfirmed(MP-10482)', tx: '0xf7b3...4c8e', time: '13:18:41' },
                { event: 'ProcessingComplete(R-008)', tx: '0xd9a2...7f1c', time: 'NEXT DAY 09:05' },
              ].map((rec, i) => (
                <div
                  key={i}
                  className="blockchain-record py-3"
                  style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <div style={{ color: '#68705A', marginBottom: 2 }}>{rec.event}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>
                    tx: {rec.tx} · {rec.time}
                  </div>
                </div>
              ))}
            </div>
          </RevealText>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 08 — POP
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="passport"
        style={{ background: 'var(--accent)', color: 'var(--bg)', padding: '15vh 8vw', minHeight: '80vh' }}
      >
        <Label>08 / PROOF OF PARTICIPATION</Label>
        
        <RevealText>
          <h2 className="font-display mb-6" style={{ fontSize: 'clamp(3rem, 10vw, 9rem)', lineHeight: 0.9 }}>
            YOUR MATERIAL<br />HAS BEEN<br />RECYCLED.
          </h2>
        </RevealText>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            { pop: '+20', reason: 'PET recycling verified', detail: 'Handover confirmed by recycler R-008' },
            { pop: '+25', reason: 'E-waste disposed', detail: 'Authorized facility, tamper-evident record' },
            { pop: '+10', reason: 'Correct segregation', detail: 'AI-verified clean stream at source' },
          ].map((item, i) => (
            <RevealText key={i} delay={i * 0.1}>
              <div style={{ borderTop: '1px solid rgba(242,239,231,0.3)', paddingTop: '1.5rem' }}>
                <div className="font-display" style={{ fontSize: '5rem', lineHeight: 1, color: 'rgba(242,239,231,0.9)' }}>
                  {item.pop}
                </div>
                <div className="font-label mt-2 mb-1" style={{ fontSize: '0.7rem', color: 'rgba(242,239,231,0.8)' }}>
                  POP
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', opacity: 0.9 }}>
                  {item.reason}
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.6, lineHeight: 1.5 }}>{item.detail}</div>
              </div>
            </RevealText>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 09 — WHO IS IT FOR
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: 'var(--bg)', padding: '15vh 8vw', minHeight: '80vh' }}
      >
        <Label>09 / ONE PLATFORM. EVERY ROLE.</Label>
        
        <RevealText>
          <h2 className="font-display mb-12" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 0.92 }}>
            HOW WILL YOU<br /><span style={{ color: 'var(--accent)' }}>USE RECY-LINK?</span>
          </h2>
        </RevealText>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              role: 'HOUSEHOLD',
              desc: 'Upload waste, get AI analysis, request collection, track your material journey and earn POP.',
              features: ['Waste photo upload', 'AI identification', 'Collection request', 'Material Passport', 'Journey tracking', 'POP rewards'],
            },
            {
              role: 'COMPANY / INSTITUTION',
              desc: 'Manage bulk waste, schedule collections, access verified recycling records, and fulfill compliance requirements.',
              features: ['Bulk waste management', 'Scheduled collections', 'E-waste tracking', 'Recycling reports', 'Compliance records'],
            },
            {
              role: 'WASTE COLLECTOR',
              desc: 'Get a verified digital identity, accept nearby collection requests, scan Material Passports and record verified handovers.',
              features: ['Digital Waste Worker ID', 'Nearby requests', 'QR passport scanner', 'Weight recording', 'Verified history'],
            },
          ].map((role, i) => (
            <RevealText key={role.role} delay={i * 0.1}>
              <div
                className="p-8"
                style={{ border: '1px solid var(--border)', height: '100%' }}
              >
                <div className="font-display text-3xl mb-4">{role.role}</div>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '2rem' }}>
                  {role.desc}
                </p>
                <ul className="space-y-2">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2" style={{ fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealText>
          ))}
        </div>
        
        <RevealText delay={0.4}>
          <div className="mt-16 text-center">
            <button
              className="btn-primary px-12 py-5 text-sm"
              onClick={() => setView('role-select')}
            >
              ENTER THE PLATFORM →
            </button>
          </div>
        </RevealText>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 10 — FINAL / MANIFESTO
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="recyclers"
        style={{ background: 'var(--text)', color: 'var(--bg)', minHeight: '100vh', padding: '15vh 8vw', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <RevealText>
          <div className="font-display" style={{ fontSize: 'clamp(4rem, 14vw, 12rem)', lineHeight: 0.88, marginBottom: '4rem' }}>
            WASTE<br />
            <span style={{ color: 'rgba(242,239,231,0.2)' }}>SHOULDN'T</span><br />
            DISAPPEAR.
          </div>
        </RevealText>
        
        <RevealText delay={0.2}>
          <div className="font-display" style={{ fontSize: 'clamp(2rem, 7vw, 6rem)', lineHeight: 0.9, color: 'var(--accent)', marginBottom: '3rem' }}>
            IT SHOULD<br />HAVE A JOURNEY.
          </div>
        </RevealText>
        
        <RevealText delay={0.4}>
          <div style={{ borderTop: '1px solid rgba(242,239,231,0.15)', paddingTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div className="font-label mb-2" style={{ color: 'rgba(242,239,231,0.4)', fontSize: '0.6rem' }}>THE TAGLINE</div>
              <p style={{ maxWidth: 500, lineHeight: 1.7, opacity: 0.6, fontSize: '0.9rem' }}>
                "Giving every waste worker an identity<br />and every recyclable material a traceable journey."
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <PETBottle width={80} />
              <button
                className="btn-ghost border-white/20 text-white/70"
                style={{ color: 'rgba(242,239,231,0.7)', borderColor: 'rgba(242,239,231,0.2)' }}
                onClick={() => setView('role-select')}
              >
                ENTER PLATFORM →
              </button>
            </div>
          </div>
        </RevealText>
      </section>
    </main>
  )
}
