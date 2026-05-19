'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeAlt?: string
  afterAlt?: string
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative aspect-video overflow-hidden select-none cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      onPointerDown={(e) => {
        isDragging.current = true
        containerRef.current?.setPointerCapture(e.pointerId)
        updatePosition(e.clientX)
      }}
      onPointerMove={(e) => {
        if (!isDragging.current) return
        updatePosition(e.clientX)
      }}
      onPointerUp={() => {
        isDragging.current = false
      }}
      onPointerCancel={() => {
        isDragging.current = false
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2))
        if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2))
      }}
      tabIndex={0}
      role="slider"
      aria-label="Before and after comparison slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
    >
      {/* After image (full width, underneath) */}
      <div className="absolute inset-0">
        <Image src={afterSrc} alt={afterAlt} fill className="object-cover" sizes="100vw" />
      </div>

      {/* Before image (clipped to left side) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={beforeSrc} alt={beforeAlt} fill className="object-cover" sizes="100vw" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white shadow-lg pointer-events-none"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-gold flex items-center justify-center shadow-xl">
          <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 4 4 4M16 9l4 4-4 4" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 pointer-events-none">
        <span className="font-body text-[10px] tracking-widest uppercase text-white">Before</span>
      </div>
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 pointer-events-none">
        <span className="font-body text-[10px] tracking-widest uppercase text-white">After</span>
      </div>
    </div>
  )
}
