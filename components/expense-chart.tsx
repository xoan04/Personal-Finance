"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"

export default function ExpenseChart() {
  const { data } = useFinance()
  const { currency } = data

  const chartData = Object.entries(data.monthlyExpenses).map(([name, gastos]) => ({ name, gastos }))

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No hay datos de gastos para mostrar
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
          <Legend />
          <Bar dataKey="gastos" fill="#8b5cf6" name="Gastos Mensuales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
