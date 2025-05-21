'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaOptionsType } from 'embla-carousel'


interface CarouselProps {
  options?: EmblaOptionsType
  children: React.ReactNode
  className?: string
  withButtons?: boolean
  slidesToShow?: number
  autoplay?: boolean
  autoplayInterval?: number
}

export function Carousel({
  options = { loop: true },
  children,
  className = '',
  withButtons = true,
  slidesToShow = 4,
  autoplay = true,
  autoplayInterval = 6000, // 6 seconds
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...options,
    containScroll: 'trimSnaps',
    dragFree: true,
    align: 'start',
    slidesToScroll: 1,
  })

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [userInteracted, setUserInteracted] = useState(false)
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Function to scroll to the next slide
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev()
      setUserInteracted(true)
      
      // Resume auto-scrolling after a delay
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current)
      }
      
      autoplayTimeoutRef.current = setTimeout(() => {
        setUserInteracted(false)
      }, autoplayInterval)
    }
  }, [emblaApi, autoplayInterval])
  
  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext()
      setUserInteracted(true)
      
      // Resume auto-scrolling after a delay
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current)
      }
      
      autoplayTimeoutRef.current = setTimeout(() => {
        setUserInteracted(false)
      }, autoplayInterval)
    }  }, [emblaApi, autoplayInterval])
  
  // Reset autoplay timer whenever there's user interaction
  const resetAutoplay = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current)
      autoplayTimeoutRef.current = null
    }
  }, [])
  // Handle user interaction with the carousel
  const onPointerDown = useCallback(() => {
    setUserInteracted(true)
    
    // Resume auto-scrolling after a delay
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current)
    }
    
    autoplayTimeoutRef.current = setTimeout(() => {
      setUserInteracted(false)
    }, autoplayInterval)
  }, [autoplayInterval])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setActiveIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  // Effect for handling auto-scrolling
  useEffect(() => {
    if (!emblaApi || !autoplay) return
    
    const handleAutoScroll = () => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollTo(0) // Scroll back to the first slide if at the end
      }
    }
    
    const timer = setInterval(handleAutoScroll, autoplayInterval)
    
    return () => {
      clearInterval(timer)
    }
  }, [emblaApi, autoplay, autoplayInterval, userInteracted])

  // Effect for setting up event listeners
  useEffect(() => {
    if (!emblaApi) return
    
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('pointerDown', onPointerDown)
    
    // Clean up
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current)
      }
      
      if (emblaApi) {
        emblaApi.off('select', onSelect)
        emblaApi.off('reInit', onSelect)
        emblaApi.off('pointerDown', onPointerDown)
      }
    }
  }, [emblaApi, onSelect, onPointerDown])
  return (
    <div className="relative">
      <div className={`overflow-hidden ${className}`} ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
      {withButtons && (
        <>
          <button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md disabled:opacity-50 -ml-5"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md disabled:opacity-50 -mr-5"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
}

export function CarouselItem({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex-shrink-0 ${className}`}>{children}</div>
}