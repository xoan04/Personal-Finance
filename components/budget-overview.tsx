"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"

export default function BudgetOverview() {
  const { totalIncome, totalExpenses, data } = useFinance()
  const { currency } = data

  // Calcular valores para la regla 50/30/20
  const needsTarget = totalIncome * 0.5
  const wantsTarget = totalIncome * 0.3
  const savingsTarget = totalIncome * 0.2

  // Valores actuales (estimados)
  const needsCurrent = totalExpenses * 0.6 // Asumimos que el 60% de los gastos son necesidades
  const wantsCurrent = totalExpenses * 0.4 // Asumimos que el 40% de los gastos son deseos
  const savingsCurrent = totalIncome - totalExpenses // Lo que queda son ahorros

  // Calcular porcentajes de cumplimiento
  const needsPercent = needsTarget > 0 ? Math.min(100, (needsCurrent / needsTarget) * 100) : 0
  const wantsPercent = wantsTarget > 0 ? Math.min(100, (wantsCurrent / wantsTarget) * 100) : 0
  const savingsPercent = savingsTarget > 0 ? Math.min(100, (savingsCurrent / savingsTarget) * 100) : 0

  // Datos para la regla 50/30/20
  const budgetData = [
    { name: "Necesidades (50%)", value: needsTarget, color: "#0ea5e9", current: needsCurrent, percent: needsPercent },
    { name: "Deseos (30%)", value: wantsTarget, color: "#8b5cf6", current: wantsCurrent, percent: wantsPercent },
    { name: "Ahorros (20%)", value: savingsTarget, color: "#10b981", current: savingsCurrent, percent: savingsPercent },
  ]

  // Datos para el gráfico de pastel
  const pieData = [
    { name: "Necesidades", value: needsCurrent, color: "#0ea5e9" },
    { name: "Deseos", value: wantsCurrent, color: "#8b5cf6" },
    { name: "Ahorros", value: savingsCurrent, color: "#10b981" },
  ].filter((item) => item.value > 0)

  if (totalIncome === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Añade ingresos y gastos para ver tu distribución según la regla 50/30/20
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Regla 50/30/20</CardTitle>
          <CardDescription>
            Distribución recomendada de tus ingresos mensuales de {formatCurrency(totalIncome, currency)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span>
                    {formatCurrency(item.current, currency)} / {formatCurrency(item.value, currency)}
                  </span>
                </div>
                <Progress value={item.percent} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {item.percent < 100
                    ? `Te faltan ${formatCurrency(item.value - item.current, currency)} para alcanzar tu meta`
                    : "¡Has alcanzado tu meta!"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución Actual</CardTitle>
          <CardDescription>Cómo estás distribuyendo realmente tus ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              {pieData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No hay datos suficientes para mostrar el gráfico
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#0ea5e9] mr-2"></div>
                    <span>Necesidades</span>
                  </div>
                  <div>
                    <span className="font-medium">{formatCurrency(needsCurrent, currency)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({totalExpenses > 0 ? ((needsCurrent / totalExpenses) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#8b5cf6] mr-2"></div>
                    <span>Deseos</span>
                  </div>
                  <div>
                    <span className="font-medium">{formatCurrency(wantsCurrent, currency)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({totalExpenses > 0 ? ((wantsCurrent / totalExpenses) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#10b981] mr-2"></div>
                    <span>Ahorros</span>
                  </div>
                  <div>
                    <span className="font-medium">{formatCurrency(savingsCurrent, currency)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({totalIncome > 0 ? ((savingsCurrent / totalIncome) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <p className="text-sm">
                    {savingsCurrent < savingsTarget
                      ? "Según la regla 50/30/20, deberías ajustar tu presupuesto para aumentar tus ahorros."
                      : "¡Felicidades! Estás cumpliendo con la regla 50/30/20 para tus ahorros."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
