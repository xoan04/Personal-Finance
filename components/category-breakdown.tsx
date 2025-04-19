"use client"
import { Progress } from "@/components/ui/progress"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"

export default function CategoryBreakdown() {
  const { data } = useFinance()
  const { currency } = data

  if (data.categoryBreakdown.length === 0) {
    return (
      <div className="py-8 sm:py-10 text-center">
        <p className="text-sm sm:text-base text-muted-foreground">
          No hay datos de categorías para mostrar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {data.categoryBreakdown.map((category) => (
        <div key={category.name} className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between gap-1">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {formatCurrency(category.amount, currency)}
              </span>
              <span className="text-muted-foreground">
                ({category.percent.toFixed(1)}%)
              </span>
            </div>
          </div>
          <Progress 
            value={category.percent} 
            className={`h-2 ${category.color}`} 
          />
        </div>
      ))}
    </div>
  )
}
