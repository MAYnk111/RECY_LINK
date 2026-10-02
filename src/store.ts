// Store — central app state using Zustand
import { create } from 'zustand'

export type Role = 'household' | 'company' | 'collector' | 'recycler' | null

export type JourneyStep =
  | 'identified'
  | 'collection_requested'
  | 'collected'
  | 'sorted'
  | 'transferred'
  | 'received'
  | 'processed'

export interface WasteAnalysis {
  material: string
  category: 'Plastic' | 'E-Waste' | 'Hazardous' | 'Paper' | 'Metal' | 'Glass'
  condition: 'Mint' | 'Good' | 'Fair' | 'Damaged' | 'Non-Functional'
  contamination: 'None' | 'Low' | 'Medium' | 'High'
  estimatedWeight: number
  recommendedPathway: 'REUSE' | 'REFURBISH' | 'MATERIAL RECOVERY' | 'RECYCLE' | 'SPECIALIZED HANDLING'
  confidence: number
  pathwayOptions: string[]
  isEwaste: boolean
  isHazardous: boolean
  decisionRationale: string
  ewasteDetails?: {
    deviceType: string
    batteryStatus: 'Intact' | 'Swollen / Damaged' | 'Removed' | 'None'
    hazardousComponents: string[]
    recoverableComponents: string[]
    recommendedAction: string
  }
  hazardDetails?: {
    hazardType: string
    safetyWarning: string
    authorizedHandlerOnly: boolean
  }
}

export interface MaterialPassport {
  id: string
  material: string
  category: string
  weight: number
  source: string
  sourceId: string
  collectorId: string | null
  recyclerId: string | null
  status: JourneyStep
  createdAt: Date
  timeline: {
    step: JourneyStep
    timestamp: Date
    location: string
    actor: string
    blockchainTx?: string
  }[]
  pathway: string
  pop_awarded: number
  imageUrl?: string
}

export interface CollectionRequest {
  id: string
  passportId: string
  userId: string
  status: 'pending' | 'assigned' | 'collected'
  collectorId?: string
  createdAt: Date
  location: string
}

export interface POPEntry {
  id: string
  amount: number
  reason: string
  timestamp: Date
  passportId?: string
}

export interface AppState {
  // Auth & Roles
  role: Role
  setRole: (r: Role) => void
  userId: string
  userName: string
  
  // View / page
  view: string
  setView: (v: string) => void
  
  // Waste upload & analysis
  uploadedImage: string | null
  setUploadedImage: (img: string | null) => void
  analysis: WasteAnalysis | null
  setAnalysis: (a: WasteAnalysis | null) => void
  analyzing: boolean
  setAnalyzing: (b: boolean) => void
  
  // Material Passports
  passports: MaterialPassport[]
  addPassport: (p: MaterialPassport) => void
  updatePassport: (id: string, updates: Partial<MaterialPassport>) => void
  getPassport: (id: string) => MaterialPassport | undefined
  
  // Collection requests
  collectionRequests: CollectionRequest[]
  addCollectionRequest: (r: CollectionRequest) => void
  updateCollectionRequest: (id: string, updates: Partial<CollectionRequest>) => void
  
  // Active passport being processed
  activePassportId: string | null
  setActivePassportId: (id: string | null) => void
  
  // POP
  pop: number
  popHistory: POPEntry[]
  awardPOP: (amount: number, reason: string, passportId?: string) => void
  
  // Modals
  openModal: string | null
  setOpenModal: (m: string | null) => void
  
  // Collector flow
  selectedCollectorId: string | null
  setSelectedCollectorId: (id: string | null) => void
  
  // Blockchain events
  blockchainEvents: { tx: string; event: string; timestamp: Date }[]
  addBlockchainEvent: (event: string) => void
  
  // Demo data seeded
  demoSeeded: boolean
  seedDemoData: () => void
}

let passportCounter = 10482
let popIdCounter = 0
let txCounter = 0

function generateTx(): string {
  txCounter++
  return `0x${Math.random().toString(16).slice(2).padEnd(64, '0').slice(0, 64)}`
}

export function generatePassportId2(): string {
  return `MP-${passportCounter++}`
}

export const useStore = create<AppState>((set, get) => ({
  role: null,
  setRole: (r) => set({ role: r }),
  userId: 'H-018',
  userName: 'Priya Sharma',
  
  view: 'landing',
  setView: (v) => set({ view: v }),
  
  uploadedImage: null,
  setUploadedImage: (img) => set({ uploadedImage: img }),
  analysis: null,
  setAnalysis: (a) => set({ analysis: a }),
  analyzing: false,
  setAnalyzing: (b) => set({ analyzing: b }),
  
  passports: [],
  addPassport: (p) => set((s) => ({ passports: [p, ...s.passports] })),
  updatePassport: (id, updates) =>
    set((s) => ({
      passports: s.passports.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  getPassport: (id) => get().passports.find((p) => p.id === id),
  
  collectionRequests: [],
  addCollectionRequest: (r) => set((s) => ({ collectionRequests: [r, ...s.collectionRequests] })),
  updateCollectionRequest: (id, updates) =>
    set((s) => ({
      collectionRequests: s.collectionRequests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  
  activePassportId: null,
  setActivePassportId: (id) => set({ activePassportId: id }),
  
  pop: 1280,
  popHistory: [
    { id: 'p0', amount: 20, reason: 'PET recycling verified', timestamp: new Date(Date.now() - 86400000 * 2), passportId: 'MP-10480' },
    { id: 'p1', amount: 25, reason: 'E-waste responsibly processed', timestamp: new Date(Date.now() - 86400000 * 5), passportId: 'MP-10479' },
    { id: 'p2', amount: 10, reason: 'Correct source segregation', timestamp: new Date(Date.now() - 86400000 * 8) },
    { id: 'p3', amount: 15, reason: 'Verified collection handover', timestamp: new Date(Date.now() - 86400000 * 12), passportId: 'MP-10477' },
    { id: 'p4', amount: 10, reason: 'Community recycling participation', timestamp: new Date(Date.now() - 86400000 * 15) },
  ],
  awardPOP: (amount, reason, passportId) =>
    set((s) => ({
      pop: s.pop + amount,
      popHistory: [
        {
          id: `pop-${popIdCounter++}`,
          amount,
          reason,
          timestamp: new Date(),
          passportId,
        },
        ...s.popHistory,
      ],
    })),
  
  openModal: null,
  setOpenModal: (m) => set({ openModal: m }),
  
  selectedCollectorId: null,
  setSelectedCollectorId: (id) => set({ selectedCollectorId: id }),
  
  blockchainEvents: [
    {
      tx: '0x' + 'a'.repeat(64),
      event: 'Material MP-10480 processing confirmed by R-008',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      tx: '0x' + 'b'.repeat(64),
      event: 'Handover confirmed: C-0217 → R-008 (1,284 g PET)',
      timestamp: new Date(Date.now() - 86400000 * 2),
    },
  ],
  addBlockchainEvent: (event) =>
    set((s) => ({
      blockchainEvents: [
        { tx: generateTx(), event, timestamp: new Date() },
        ...s.blockchainEvents,
      ],
    })),
  
  demoSeeded: false,
  seedDemoData: () => {
    if (get().demoSeeded) return
    const demoPassport: MaterialPassport = {
      id: 'MP-10481',
      material: 'PET Bottle',
      category: 'Plastic',
      weight: 42.8,
      source: 'Household',
      sourceId: 'H-018',
      collectorId: 'C-0217',
      recyclerId: 'R-008',
      status: 'processed',
      createdAt: new Date(Date.now() - 86400000 * 1.5),
      pathway: 'RECYCLE',
      pop_awarded: 20,
      timeline: [
        {
          step: 'identified',
          timestamp: new Date(Date.now() - 86400000 * 1.5),
          location: 'Kothrud, Pune',
          actor: 'H-018 (Priya Sharma)',
          blockchainTx: generateTx(),
        },
        {
          step: 'collection_requested',
          timestamp: new Date(Date.now() - 86400000 * 1.4),
          location: 'Kothrud, Pune',
          actor: 'H-018 (Priya Sharma)',
        },
        {
          step: 'collected',
          timestamp: new Date(Date.now() - 86400000 * 1.2),
          location: 'Kothrud, Pune',
          actor: 'C-0217 (Ramesh Kumar)',
          blockchainTx: generateTx(),
        },
        {
          step: 'sorted',
          timestamp: new Date(Date.now() - 86400000 * 1.1),
          location: 'Warje Sorting Facility',
          actor: 'Warje Facility',
          blockchainTx: generateTx(),
        },
        {
          step: 'transferred',
          timestamp: new Date(Date.now() - 86400000 * 1.0),
          location: 'Warje → Hadapsar',
          actor: 'Logistics Partner',
          blockchainTx: generateTx(),
        },
        {
          step: 'received',
          timestamp: new Date(Date.now() - 86400000 * 0.8),
          location: 'Hadapsar Recycling Hub',
          actor: 'R-008 (EcoCycle Pvt. Ltd.)',
          blockchainTx: generateTx(),
        },
        {
          step: 'processed',
          timestamp: new Date(Date.now() - 86400000 * 0.6),
          location: 'Hadapsar Recycling Hub',
          actor: 'R-008 (EcoCycle Pvt. Ltd.)',
          blockchainTx: generateTx(),
        },
      ],
    }
    set({ demoSeeded: true })
    get().addPassport(demoPassport)
  },
}))

// Mock AI analysis service with multiple category intelligence
export async function analyzWaste(categoryHint: string = 'pet'): Promise<WasteAnalysis> {
  await new Promise((r) => setTimeout(r, 2200))
  
  if (categoryHint === 'ewaste-laptop' || categoryHint === 'laptop') {
    return {
      material: 'Dell Inspiron Laptop',
      category: 'E-Waste',
      condition: 'Non-Functional',
      contamination: 'Low',
      estimatedWeight: 1850.0,
      recommendedPathway: 'SPECIALIZED HANDLING',
      confidence: 96,
      pathwayOptions: ['REFURBISH', 'MATERIAL RECOVERY', 'SPECIALIZED HANDLING'],
      isEwaste: true,
      isHazardous: true,
      decisionRationale: 'Contains internal Li-ion battery and motherboards. Non-functional condition warrants component recovery and PCB-authorized hazardous handling.',
      ewasteDetails: {
        deviceType: 'Laptop / Notebook',
        batteryStatus: 'Intact',
        hazardousComponents: ['Li-ion Battery (42Wh)', 'Lead Solder', 'Mercury Backlight trace'],
        recoverableComponents: ['Aluminum Frame (320g)', 'RAM 8GB', 'Copper Heat Pipes', 'Display Panel'],
        recommendedAction: 'Route exclusively to PCB-authorized E-waste recycler (R-022)',
      },
    }
  }

  if (categoryHint === 'ewaste-phone' || categoryHint === 'phone') {
    return {
      material: 'Smartphone (Android)',
      category: 'E-Waste',
      condition: 'Fair',
      contamination: 'None',
      estimatedWeight: 195.0,
      recommendedPathway: 'REFURBISH',
      confidence: 92,
      pathwayOptions: ['REFURBISH', 'MATERIAL RECOVERY', 'RECYCLE'],
      isEwaste: true,
      isHazardous: false,
      decisionRationale: 'Device boots and screen is intact. High secondary market value; refurbishment recommended prior to material recovery.',
      ewasteDetails: {
        deviceType: 'Smartphone',
        batteryStatus: 'Intact',
        hazardousComponents: ['Li-Po Battery (4000mAh)'],
        recoverableComponents: ['OLED Display', 'Rare Earth Magnets', 'Gold-plated connectors'],
        recommendedAction: 'Refurbish for secondary life or certified electronic dismantler',
      },
    }
  }

  if (categoryHint === 'hazardous-battery' || categoryHint === 'battery') {
    return {
      material: 'Swollen Li-ion Powerbank & Batteries',
      category: 'Hazardous',
      condition: 'Damaged',
      contamination: 'High',
      estimatedWeight: 420.0,
      recommendedPathway: 'SPECIALIZED HANDLING',
      confidence: 98,
      pathwayOptions: ['SPECIALIZED HANDLING'],
      isEwaste: true,
      isHazardous: true,
      decisionRationale: 'Physical swelling detected on battery casing. High thermal runaway risk. Must NOT be routed to informal municipal collectors.',
      hazardDetails: {
        hazardType: 'Thermal Runaway / Lithium Chemical Hazard',
        safetyWarning: 'Do NOT puncture, crush, or expose to heat. Store in non-combustible sand/vermiculite container.',
        authorizedHandlerOnly: true,
      },
    }
  }

  if (categoryHint === 'paper') {
    return {
      material: 'Corrugated Cardboard Packaging',
      category: 'Paper',
      condition: 'Good',
      contamination: 'Low',
      estimatedWeight: 480.0,
      recommendedPathway: 'RECYCLE',
      confidence: 95,
      pathwayOptions: ['REUSE', 'RECYCLE', 'MATERIAL RECOVERY'],
      isEwaste: false,
      isHazardous: false,
      decisionRationale: 'Dry, unsoiled Kraft fiber suitable for hydro-pulping into secondary packaging.',
    }
  }

  // Default: PET Plastic bottle
  return {
    material: 'Transparent PET Plastic Bottle',
    category: 'Plastic',
    condition: 'Good',
    contamination: 'Low',
    estimatedWeight: 42.8,
    recommendedPathway: 'RECYCLE',
    confidence: 94,
    pathwayOptions: ['RECYCLE', 'REUSE', 'MATERIAL RECOVERY'],
    isEwaste: false,
    isHazardous: false,
    decisionRationale: 'Clean clear Polyethylene Terephthalate with minimal adhesive residue. High circular value for food-grade rPET pelletizing.',
  }
}

// Mock blockchain record service
export async function recordBlockchainEvent(event: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200))
  return generateTx()
}

// Available demo collectors
export const DEMO_COLLECTORS = [
  {
    id: 'C-0217',
    name: 'Ramesh Kumar',
    area: 'Kothrud, Pune',
    distance: '1.2 km',
    materials: ['PET', 'Paper', 'Metal', 'Glass'],
    verified: true,
    rating: 4.9,
    collections: 247,
    recovered: '1,284 KG',
    available: true,
    experience: '6 years',
  },
  {
    id: 'C-0182',
    name: 'Sunita Devi',
    area: 'Karve Nagar, Pune',
    distance: '2.4 km',
    materials: ['PET', 'E-Waste', 'Metal'],
    verified: true,
    rating: 4.7,
    collections: 189,
    recovered: '892 KG',
    available: true,
    experience: '4 years',
  },
  {
    id: 'C-0301',
    name: 'Mohammed Aslam',
    area: 'Deccan, Pune',
    distance: '3.1 km',
    materials: ['PET', 'Paper', 'Cardboard', 'Glass'],
    verified: true,
    rating: 4.6,
    collections: 134,
    recovered: '678 KG',
    available: false,
    experience: '3 years',
  },
]

export const DEMO_RECYCLER = {
  id: 'R-008',
  name: 'EcoCycle Pvt. Ltd.',
  area: 'Hadapsar, Pune',
  materials: ['PET', 'HDPE', 'PP', 'Paper', 'Metal'],
  capacity: '2 tonnes/day',
  verified: true,
  certifications: ['ISO 14001', 'PCB Authorized', 'EPR Certified'],
}
