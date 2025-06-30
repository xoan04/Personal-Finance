"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BarChart3 } from "lucide-react"

export default function ExpenseChart() {
  const { data, monthlyData } = useFinance()
  const { currency } = data
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular tiempo de carga para mostrar las animaciones
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Calcular gastos por categoría del mes seleccionado
  const categoryTotals: Record<string, number> = {}
  
  monthlyData.expenses.forEach((expense) => {
    const category = expense.category
    categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
  })

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    gastos: amount
  }))

  if (isLoading) {
    return (
      <div className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="md" />
        <p className="text-sm text-muted-foreground">Cargando gráfico de gastos...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center space-y-4 animate-fade-in-up">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
          No hay datos de gastos para mostrar
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Añade algunos gastos para ver el gráfico
        </p>
      </div>
    )
  }

  return (
    <div className="h-[300px] sm:h-[400px] w-full -mx-4 sm:mx-0 animate-fade-in-up">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            tickMargin={5}
            angle={-45}
            textAnchor="end"
            height={50}
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => formatCurrency(Number(value), currency)}
            width={65}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value), currency)}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
            cursor={{ fill: "hsl(var(--muted))" }}
          />
          <Legend 
            wrapperStyle={{
              fontSize: "12px",
              marginTop: "4px"
            }}
            height={25}
          />
          <Bar 
            dataKey="gastos" 
            fill="hsl(var(--primary))" 
            name="Gastos Mensuales"
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
