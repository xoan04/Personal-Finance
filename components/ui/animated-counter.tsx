"use client"

import { useCounter } from "@/hooks/use-counter"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Currency } from "@/lib/types"

interface AnimatedCounterProps {
  value: number
  currency?: Currency
  duration?: number
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  showCurrency?: boolean
}

export function AnimatedCounter({
  value,
  currency,
  duration = 1500,
  delay = 200,
  className,
  prefix,
  suffix,
  decimals = 0,
  showCurrency = true
}: AnimatedCounterProps) {
  const { count, isAnimating } = useCounter(value, {
    duration,
    delay,
    ease: 'ease-out'
  })

  const displayValue = showCurrency && currency
    ? formatCurrency(count, currency)
    : count.toLocaleString('es-ES', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })

  return (
    <span 
      className={cn(
        "transition-all duration-300",
        isAnimating && "scale-105",
        className
      )}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
} 