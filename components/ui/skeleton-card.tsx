import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  lines?: number
  height?: string
}

export function SkeletonCard({ className, lines = 3, height = "h-4" }: SkeletonCardProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-muted rounded",
              height,
              i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonCircle({ className, size = "h-12 w-12" }: { className?: string; size?: string }) {
  return (
    <div className={cn("animate-pulse bg-muted rounded-full", size, className)} />
  )
}

export function SkeletonRectangle({ className, height = "h-4", width = "w-full" }: { 
  className?: string; 
  height?: string; 
  width?: string 
}) {
  return (
    <div className={cn("animate-pulse bg-muted rounded", height, width, className)} />
  )
} 