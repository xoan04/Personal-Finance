"use client"

import { useMemo, useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

export default function MonthlyCategoryBreakdown() {
  const { monthlyData, totalExpenses, data } = useFinance()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular tiempo de carga para mostrar las animaciones
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  const categoryBreakdown = useMemo(() => {
    // Agrupar gastos por categoría del mes seleccionado
    const categories: Record<string, { amount: number; color: string }> = {
      alimentacion: { amount: 0, color: "#3b82f6" },
      transporte: { amount: 0, color: "#10b981" },
      servicios: { amount: 0, color: "#f59e0b" },
      entretenimiento: { amount: 0, color: "#8b5cf6" },
      salud: { amount: 0, color: "#ef4444" },
      ahorro: { amount: 0, color: "#14b8a6" },
      otros: { amount: 0, color: "#6b7280" },
    }

    // Mapeo de categorías en español
    const categoryNames: Record<string, string> = {
      alimentacion: "Alimentación",
      transporte: "Transporte",
      servicios: "Servicios",
      entretenimiento: "Entretenimiento",
      salud: "Salud",
      ahorro: "Ahorro",
      otros: "Otros",
    }

    // Agrupar gastos por categoría del mes seleccionado
    monthlyData.expenses.forEach((expense) => {
      const categoryKey = expense.category.toLowerCase()
      if (categories[categoryKey]) {
        categories[categoryKey].amount += expense.amount
      } else {
        categories.otros.amount += expense.amount
      }
    })

    // Convertir a array y calcular porcentajes
    return Object.entries(categories)
      .map(([key, { amount, color }]) => ({
        name: categoryNames[key] || key,
        amount,
        percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color,
      }))
      .filter((category) => category.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [monthlyData.expenses, totalExpenses])

  // Datos para el gráfico de pastel
  const pieData = categoryBreakdown.map((category) => ({
    name: category.name,
    value: category.amount,
    color: category.color
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (categoryBreakdown.length === 0) {
    return (
      <div className="text-center py-8 animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-muted-foreground">No hay gastos registrados este mes</p>
        <p className="text-xs text-muted-foreground mt-1">Añade algunos gastos para ver la distribución</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Gráfico de pastel */}
      {pieData.length > 0 && (
        <div className="aspect-square w-full max-w-[200px] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, data.currency)}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="space-y-4">
        {categoryBreakdown.map((category, index) => (
          <div key={category.name} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  <AnimatedCounter 
                    value={category.amount} 
                    currency={data.currency}
                    duration={1500}
                    delay={600 + index * 200}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <AnimatedCounter 
                    value={category.percent} 
                    showCurrency={false}
                    decimals={1}
                    duration={1500}
                    delay={800 + index * 200}
                    suffix="%"
                  />
                </div>
              </div>
            </div>
            <Progress 
              value={category.percent} 
              className="h-2" 
              style={{
                '--progress-color': category.color
              } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  )
} 