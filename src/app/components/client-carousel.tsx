'use client'

import React from 'react'
import { Carousel as UICarousel, CarouselItem } from '@/components/ui/carousel'
import type { EmblaOptionsType } from 'embla-carousel'

interface ClientCarouselProps {
  children: React.ReactNode
  className?: string
  options?: EmblaOptionsType
  autoplay?: boolean
  autoplayInterval?: number
  withButtons?: boolean
}

export function ClientCarousel({ 
  children, 
  className = '',
  options = { loop: true },
  autoplay = true,
  autoplayInterval = 6000,
  withButtons = true
}: ClientCarouselProps) {
  return (
    <UICarousel 
      className={className} 
      options={options}
      autoplay={autoplay}
      autoplayInterval={autoplayInterval}
      withButtons={withButtons}
    >
      {children}
    </UICarousel>
  )
}

export { CarouselItem }
