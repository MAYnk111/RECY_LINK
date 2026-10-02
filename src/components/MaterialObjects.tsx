import React from 'react'

export function EWasteDevice({ width = 140, className = '', style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  const height = width * 1.3
  return (
    <svg width={width} height={height} viewBox="0 0 140 182" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Shadow */}
      <ellipse cx="70" cy="172" rx="55" ry="7" fill="rgba(0,0,0,0.12)" />
      {/* Laptop / Tablet body */}
      <rect x="20" y="24" width="100" height="135" rx="8" fill="#1C1D21" stroke="#3E424B" strokeWidth="2" />
      {/* Screen area */}
      <rect x="26" y="32" width="88" height="110" rx="4" fill="#0E1015" />
      {/* Circuit / Display graphic */}
      <path d="M 36 60 L 55 60 L 70 80 L 104 80" stroke="#68705A" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="36" cy="60" r="3" fill="#68705A" />
      <circle cx="104" cy="80" r="3" fill="#7E2632" />
      <rect x="42" y="100" width="56" height="24" rx="2" fill="rgba(255,255,255,0.06)" />
      <text x="70" y="115" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.6)" fontFamily="'Courier New', monospace">E-WASTE</text>
      {/* Camera notch */}
      <circle cx="70" cy="28" r="1.5" fill="#4B5563" />
      {/* Bottom base / connector */}
      <rect x="52" y="161" width="36" height="4" rx="2" fill="#4B5563" />
    </svg>
  )
}

export function HazardousBattery({ width = 110, className = '', style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  const height = width * 1.5
  return (
    <svg width={width} height={height} viewBox="0 0 110 165" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Shadow */}
      <ellipse cx="55" cy="156" rx="42" ry="6" fill="rgba(0,0,0,0.14)" />
      {/* Terminal caps */}
      <rect x="36" y="12" width="14" height="10" rx="2" fill="#9CA3AF" stroke="#4B5563" />
      <rect x="60" y="12" width="14" height="10" rx="2" fill="#DC2626" stroke="#991B1B" />
      {/* Main Cell body */}
      <rect x="18" y="22" width="74" height="128" rx="6" fill="#18181B" stroke="#27272A" strokeWidth="2" />
      {/* Warning Chevron Band */}
      <rect x="20" y="55" width="70" height="32" fill="#F59E0B" />
      {[0, 14, 28, 42, 56].map(x => (
        <polygon key={x} points={`${22 + x},55 ${30 + x},55 ${24 + x},87 ${16 + x},87`} fill="#18181B" />
      ))}
      {/* Hazard Symbol */}
      <circle cx="55" cy="112" r="14" fill="rgba(220,38,38,0.18)" />
      <text x="55" y="117" textAnchor="middle" fontSize="13" fill="#DC2626" fontWeight="bold">⚠</text>
      <text x="55" y="138" textAnchor="middle" fontSize="6.5" fill="rgba(255,255,255,0.7)" fontFamily="'Inter', sans-serif" letterSpacing="0.08em">LI-ION HAZMAT</text>
    </svg>
  )
}

export function CardboardPackage({ width = 140, className = '', style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  const height = width * 1.2
  return (
    <svg width={width} height={height} viewBox="0 0 140 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Shadow */}
      <ellipse cx="70" cy="158" rx="55" ry="7" fill="rgba(0,0,0,0.1)" />
      {/* Box back */}
      <polygon points="20,55 70,25 120,55 70,85" fill="#D4A373" stroke="#BC6C25" strokeWidth="1.5" />
      {/* Box Left */}
      <polygon points="20,55 70,85 70,145 20,115" fill="#BC6C25" stroke="#9B5818" strokeWidth="1.5" />
      {/* Box Right */}
      <polygon points="70,85 120,55 120,115 70,145" fill="#A45A16" stroke="#7F4410" strokeWidth="1.5" />
      {/* Tape across seam */}
      <polygon points="64,28 76,22 76,82 64,88" fill="rgba(235, 214, 180, 0.7)" />
      <polygon points="64,88 76,82 76,142 64,148" fill="rgba(235, 214, 180, 0.6)" />
      {/* Fragile / Recycle stamp */}
      <text x="45" y="115" fontSize="14" fill="rgba(23,23,23,0.3)" transform="rotate(-15 45 115)">♻</text>
      <text x="92" y="112" fontSize="6" fill="rgba(255,255,255,0.6)" fontFamily="'Courier New', monospace" transform="rotate(15 92 112)">KRAFT-100</text>
    </svg>
  )
}

export function AluminiumCan({ width = 100, className = '', style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  const height = width * 1.8
  return (
    <svg width={width} height={height} viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <linearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="25%" stopColor="#E5E7EB" />
          <stop offset="50%" stopColor="#F9FAFB" />
          <stop offset="75%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="50" cy="170" rx="34" ry="6" fill="rgba(0,0,0,0.12)" />
      {/* Can Body */}
      <rect x="22" y="28" width="56" height="134" rx="10" fill="url(#metalBody)" stroke="#9CA3AF" strokeWidth="1" />
      {/* Top Rim */}
      <ellipse cx="50" cy="28" rx="28" ry="7" fill="#E5E7EB" stroke="#6B7280" />
      <ellipse cx="50" cy="27" rx="22" ry="5" fill="#9CA3AF" />
      {/* Pull tab */}
      <rect x="46" y="24" width="8" height="6" rx="2" fill="#D1D5DB" stroke="#4B5563" />
      {/* Middle Label Band */}
      <rect x="23" y="65" width="54" height="60" fill="rgba(126, 38, 50, 0.85)" />
      <text x="50" y="96" textAnchor="middle" fontSize="9" fontWeight="900" fill="#F2EFE7" fontFamily="'Barlow Condensed', sans-serif" letterSpacing="0.1em">ALU CAN</text>
      <text x="50" y="108" textAnchor="middle" fontSize="6" fill="rgba(242,239,231,0.7)" fontFamily="'Inter', sans-serif">100% RECYCLE</text>
      {/* Bottom Rim */}
      <ellipse cx="50" cy="162" rx="26" ry="6" fill="#9CA3AF" stroke="#4B5563" />
    </svg>
  )
}

export function GlassBottle({ width = 90, className = '', style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  const height = width * 2.6
  return (
    <svg width={width} height={height} viewBox="0 0 90 234" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <linearGradient id="glassBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(40, 75, 55, 0.85)" />
          <stop offset="30%" stopColor="rgba(85, 140, 105, 0.92)" />
          <stop offset="50%" stopColor="rgba(130, 185, 150, 0.75)" />
          <stop offset="80%" stopColor="rgba(60, 105, 80, 0.9)" />
          <stop offset="100%" stopColor="rgba(30, 55, 40, 0.95)" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="45" cy="224" rx="30" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* Glass Body */}
      <path
        d="M 37 14 L 53 14 L 53 45 Q 68 75 68 115 L 68 210 Q 68 218 45 218 Q 22 218 22 210 L 22 115 Q 22 75 37 45 Z"
        fill="url(#glassBody)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      {/* Cork / Cap */}
      <rect x="36" y="4" width="18" height="12" rx="2" fill="#D4A373" stroke="#8C5828" />
      {/* Specular highlight */}
      <path d="M 30 75 Q 26 115 26 195" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
      <text x="45" y="155" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.7)" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">CULLET</text>
    </svg>
  )
}
