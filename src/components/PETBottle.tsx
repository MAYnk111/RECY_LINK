// PETBottle — realistic SVG/CSS PET bottle visual
// Used as the hero scroll object throughout the landing page

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface PETBottleProps {
  width?: number
  className?: string
  style?: React.CSSProperties
  animated?: boolean
  crushed?: boolean // show slightly crushed/deformed state
}

export function PETBottle({ width = 280, className = '', style, animated = false, crushed = false }: PETBottleProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  
  useEffect(() => {
    if (!animated || !svgRef.current) return
    gsap.to(svgRef.current, {
      y: -10,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }, [animated])
  
  const height = width * 2.8
  const cx = width / 2
  
  // Bottle geometry
  const capH = height * 0.06
  const neckTop = height * 0.06
  const neckBottom = height * 0.16
  const shoulderBottom = height * 0.24
  const bodyBottom = height * 0.88
  const baseBottom = height * 0.96
  const capW = width * 0.22
  const neckTopW = width * 0.22
  const neckBottomW = width * 0.3
  const shoulderW = width * 0.7
  const bodyW = width * 0.78
  const baseW = width * 0.72
  
  // Slight crush if crushed
  const crushOffset = crushed ? 4 : 0
  const bodyWL = bodyW - crushOffset
  const bodyWR = bodyW + crushOffset
  
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* PET bottle gradient - transparent with reflections */}
        <linearGradient id="petBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(180,210,230,0.55)" />
          <stop offset="18%" stopColor="rgba(220,240,255,0.85)" />
          <stop offset="35%" stopColor="rgba(240,250,255,0.92)" />
          <stop offset="50%" stopColor="rgba(200,230,250,0.75)" />
          <stop offset="70%" stopColor="rgba(160,200,230,0.6)" />
          <stop offset="85%" stopColor="rgba(200,225,245,0.8)" />
          <stop offset="100%" stopColor="rgba(150,190,220,0.5)" />
        </linearGradient>
        <linearGradient id="petCap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8faab5" />
          <stop offset="50%" stopColor="#7a9aaa" />
          <stop offset="100%" stopColor="#5c7885" />
        </linearGradient>
        <linearGradient id="petHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="petLabel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(245,240,232,0.88)" />
          <stop offset="100%" stopColor="rgba(235,228,220,0.82)" />
        </linearGradient>
        <linearGradient id="petShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(90,130,155,0.3)" />
          <stop offset="100%" stopColor="rgba(90,130,155,0)" />
        </linearGradient>
        <linearGradient id="petBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(160,200,225,0.7)" />
          <stop offset="100%" stopColor="rgba(100,155,185,0.85)" />
        </linearGradient>
        <filter id="bottle-blur">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <clipPath id="bottleClip">
          <path d={`
            M ${cx - capW/2} ${neckTop}
            L ${cx + capW/2} ${neckTop}
            L ${cx + neckBottomW/2} ${neckBottom}
            Q ${cx + shoulderW/2} ${shoulderBottom} ${cx + (crushed ? bodyWR : bodyW)/2} ${shoulderBottom + (height * 0.12)}
            L ${cx + (crushed ? bodyWR : bodyW)/2} ${bodyBottom}
            Q ${cx + baseW/2} ${bodyBottom + height*0.02} ${cx + baseW/2} ${baseBottom}
            L ${cx - baseW/2} ${baseBottom}
            Q ${cx - baseW/2} ${bodyBottom + height*0.02} ${cx - (crushed ? bodyWL : bodyW)/2} ${bodyBottom}
            L ${cx - (crushed ? bodyWL : bodyW)/2} ${shoulderBottom + (height * 0.12)}
            Q ${cx - shoulderW/2} ${shoulderBottom} ${cx - neckBottomW/2} ${neckBottom}
            Z
          `} />
        </clipPath>
      </defs>
      
      {/* Drop shadow */}
      <ellipse
        cx={cx + 15}
        cy={baseBottom + 8}
        rx={baseW/2 * 0.7}
        ry={8}
        fill="rgba(0,0,0,0.12)"
        filter="url(#bottle-blur)"
      />
      
      {/* Bottle body */}
      <path
        d={`
          M ${cx - capW/2 + 2} ${neckTop + 2}
          L ${cx + capW/2 - 2} ${neckTop + 2}
          L ${cx + neckBottomW/2} ${neckBottom}
          Q ${cx + shoulderW/2} ${shoulderBottom} ${cx + (crushed ? bodyWR : bodyW)/2} ${shoulderBottom + (height * 0.12)}
          L ${cx + (crushed ? bodyWR : bodyW)/2} ${bodyBottom}
          Q ${cx + baseW/2} ${bodyBottom + height*0.02} ${cx + baseW/2} ${baseBottom - 2}
          L ${cx - baseW/2} ${baseBottom - 2}
          Q ${cx - baseW/2} ${bodyBottom + height*0.02} ${cx - (crushed ? bodyWL : bodyW)/2} ${bodyBottom}
          L ${cx - (crushed ? bodyWL : bodyW)/2} ${shoulderBottom + (height * 0.12)}
          Q ${cx - shoulderW/2} ${shoulderBottom} ${cx - neckBottomW/2} ${neckBottom}
          Z
        `}
        fill="url(#petBody)"
        stroke="rgba(120,170,200,0.4)"
        strokeWidth="0.8"
      />
      
      {/* Left shadow edge */}
      <rect
        x={cx - (crushed ? bodyWL : bodyW)/2}
        y={shoulderBottom + height*0.12}
        width={width * 0.12}
        height={bodyBottom - shoulderBottom - height*0.12}
        fill="url(#petShadow)"
        clipPath="url(#bottleClip)"
      />
      
      {/* Horizontal ribbing lines — characteristic of PET bottles */}
      {[0.32, 0.42, 0.52, 0.62, 0.72, 0.8].map((pct, i) => {
        const y = shoulderBottom + (bodyBottom - shoulderBottom) * ((pct - 0.24) / 0.64)
        const w = bodyW * 0.85
        return (
          <line
            key={i}
            x1={cx - w/2 + 4}
            y1={y}
            x2={cx + w/2 - 4}
            y2={y}
            stroke="rgba(100,160,200,0.25)"
            strokeWidth="1"
            clipPath="url(#bottleClip)"
          />
        )
      })}
      
      {/* Label area */}
      <rect
        x={cx - bodyW/2 + 4}
        y={height * 0.35}
        width={bodyW - 8}
        height={height * 0.28}
        fill="url(#petLabel)"
        rx="1"
        clipPath="url(#bottleClip)"
      />
      
      {/* Label content: subtle RECY-LINK text */}
      <text
        x={cx}
        y={height * 0.48}
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        fontSize={width * 0.07}
        fontWeight="600"
        letterSpacing="0.1em"
        fill="rgba(126,38,50,0.55)"
        clipPath="url(#bottleClip)"
      >
        RECY-LINK
      </text>
      <text
        x={cx}
        y={height * 0.53}
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        fontSize={width * 0.038}
        letterSpacing="0.12em"
        fill="rgba(126,38,50,0.35)"
        clipPath="url(#bottleClip)"
      >
        MP-10482
      </text>
      
      {/* Highlight stripe */}
      <rect
        x={cx - width*0.05}
        y={neckTop}
        width={width * 0.1}
        height={baseBottom - neckTop}
        fill="url(#petHighlight)"
        clipPath="url(#bottleClip)"
      />
      
      {/* Scratch marks if crushed */}
      {crushed && (
        <>
          <line x1={cx + bodyW/2 * 0.3} y1={height*0.4} x2={cx + bodyW/2 * 0.5} y2={height*0.5}
            stroke="rgba(120,170,200,0.3)" strokeWidth="0.8" clipPath="url(#bottleClip)" />
          <line x1={cx - bodyW/2 * 0.2} y1={height*0.55} x2={cx - bodyW/2 * 0.4} y2={height*0.65}
            stroke="rgba(120,170,200,0.3)" strokeWidth="0.6" clipPath="url(#bottleClip)" />
        </>
      )}
      
      {/* Cap/lid */}
      <rect
        x={cx - capW/2}
        y={0}
        width={capW}
        height={capH + neckTop}
        rx="2"
        fill="url(#petCap)"
        stroke="rgba(70,110,130,0.4)"
        strokeWidth="0.8"
      />
      {/* Cap ribbing */}
      {[0.25, 0.5, 0.75].map((pct, i) => (
        <line
          key={i}
          x1={cx - capW/2 + 1}
          y1={(capH + neckTop) * pct}
          x2={cx + capW/2 - 1}
          y2={(capH + neckTop) * pct}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.6"
        />
      ))}
      
      {/* Base */}
      <path
        d={`M ${cx - baseW/2} ${baseBottom - 2} Q ${cx} ${baseBottom + 8} ${cx + baseW/2} ${baseBottom - 2}`}
        fill="url(#petBase)"
        clipPath="url(#bottleClip)"
      />
    </svg>
  )
}

export default PETBottle
