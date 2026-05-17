'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, PawPrint } from 'lucide-react'

interface PetDetailGalleryProps {
  images: { image_url: string; position: number }[]
  petName: string
}

export function PetDetailGallery({ images, petName }: PetDetailGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position)
  const [activeIndex, setActiveIndex] = useState(0)

  if (sorted.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-900/20 to-zinc-900 flex items-center justify-center">
        <PawPrint className="w-24 h-24 text-white/10" />
      </div>
    )
  }

  const prev = () => setActiveIndex(i => (i - 1 + sorted.length) % sorted.length)
  const next = () => setActiveIndex(i => (i + 1) % sorted.length)

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-none sm:rounded-3xl bg-zinc-900">
        <Image
          key={activeIndex}
          src={sorted[activeIndex].image_url}
          alt={`${petName} - foto ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 600px"
          className="object-cover"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

        {/* Arrows */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/70 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/70 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {sorted.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === activeIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 px-4 sm:px-0 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.image_url}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex ? 'border-amber-500' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img.image_url}
                alt={`${petName} miniatura ${i + 1}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
