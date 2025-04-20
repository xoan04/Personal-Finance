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
      <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
        <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
          No hay datos de gastos para mostrar
        </p>
      </div>
    )
  }

  return (
    <div className="h-[300px] sm:h-[400px] w-full -mx-4 sm:mx-0">
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
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
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
              borderRadius: "6px",
              fontSize: "12px"
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
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
