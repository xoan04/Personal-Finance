"use client"
import { Progress } from "@/components/ui/progress"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"

export default function CategoryBreakdown() {
  const { data } = useFinance()
  const { currency } = data

  if (data.categoryBreakdown.length === 0) {
    return <div className="py-10 text-center text-muted-foreground">No hay datos de categorías para mostrar</div>
  }

  return (
    <div className="space-y-4">
      {data.categoryBreakdown.map((category) => (
        <div key={category.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{category.name}</span>
            <span className="font-medium">{formatCurrency(category.amount, currency)}</span>
          </div>
          <Progress value={category.percent} className={`h-2 ${category.color}`} />
          <p className="text-xs text-muted-foreground text-right">{category.percent.toFixed(1)}%</p>
        </div>
      ))}
    </div>
  )
}
