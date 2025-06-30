import { useState, useEffect } from 'react'

interface UseCounterOptions {
  duration?: number
  delay?: number
  ease?: 'linear' | 'ease-out' | 'ease-in' | 'ease-in-out'
}

export function useCounter(
  targetValue: number,
  options: UseCounterOptions = {}
) {
  const { duration = 1000, delay = 0, ease = 'ease-out' } = options
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (targetValue === 0) {
      setCount(0)
      return
    }

    const timer = setTimeout(() => {
      setIsAnimating(true)
      const startTime = Date.now()
      const startValue = count

      const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Función de easing
        let easedProgress = progress
        switch (ease) {
          case 'ease-out':
            easedProgress = 1 - Math.pow(1 - progress, 3)
            break
          case 'ease-in':
            easedProgress = Math.pow(progress, 3)
            break
          case 'ease-in-out':
            easedProgress = progress < 0.5 
              ? 4 * progress * progress * progress 
              : 1 - Math.pow(-2 * progress + 2, 3) / 2
            break
          default:
            easedProgress = progress
        }

        const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress)
        setCount(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [targetValue, duration, delay, ease, count])

  return { count, isAnimating }
} 