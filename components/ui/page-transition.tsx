"use client"

import { useEffect, useState } from "react"
import { LoadingSpinner } from "./loading-spinner"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Pequeño delay para mostrar la transición
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div 
      className={`animate-fade-in-up ${className || ''}`}
      style={{ animationDelay: '0.1s' }}
    >
      {children}
    </div>
  )
} 