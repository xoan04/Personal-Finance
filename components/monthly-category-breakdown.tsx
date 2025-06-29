"use client"

import { useMemo } from "react"
import { useFinance } from "@/context/finance-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function MonthlyCategoryBreakdown() {
  const { monthlyData, totalExpenses } = useFinance()

  const categoryBreakdown = useMemo(() => {
    // Agrupar gastos por categoría del mes seleccionado
    const categories: Record<string, { amount: number; color: string }> = {
      alimentacion: { amount: 0, color: "bg-blue-500" },
      transporte: { amount: 0, color: "bg-green-500" },
      servicios: { amount: 0, color: "bg-yellow-500" },
      entretenimiento: { amount: 0, color: "bg-purple-500" },
      salud: { amount: 0, color: "bg-red-500" },
      ahorro: { amount: 0, color: "bg-teal-500" },
      otros: { amount: 0, color: "bg-gray-500" },
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

  if (categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
          <CardDescription>No hay gastos registrados este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No se han registrado gastos en este mes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>Distribución de gastos del mes seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryBreakdown.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {category.percent.toFixed(1)}%
                </span>
              </div>
              <Progress value={category.percent} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 