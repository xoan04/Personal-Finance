"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"

import BudgetOverview from "@/components/budget-overview"
import ExpenseForm from "@/components/expense-form"
import IncomeForm from "@/components/income-form"
import ExpenseChart from "@/components/expense-chart"
import CategoryBreakdown from "@/components/category-breakdown"
import FutureGoals from "@/components/future-goals"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"
import { CurrencySelector } from "@/components/currency-selector"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"

export default function Home() {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const { totalIncome, totalExpenses, balance, data, loading } = useFinance()
  const { user } = useAuth()

  const content = (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi Presupuesto Personal</h1>
        <div className="flex items-center gap-4">
          <CurrencySelector />
          <UserNav />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando tus datos financieros...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ingresos Mensuales</CardTitle>
                <CardDescription>Total de ingresos este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome, data.currency)}</div>
                <Button variant="ghost" className="mt-2 text-sm" onClick={() => setShowIncomeForm(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Añadir ingreso
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Gastos Mensuales</CardTitle>
                <CardDescription>Total de gastos este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses, data.currency)}</div>
                <Button variant="ghost" className="mt-2 text-sm" onClick={() => setShowExpenseForm(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Añadir gasto
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Balance</CardTitle>
                <CardDescription>Dinero disponible</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(balance, data.currency)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalIncome > 0
                    ? `${Math.round((balance / totalIncome) * 100)}% de tus ingresos`
                    : "0% de tus ingresos"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="budget">Presupuesto 50/30/20</TabsTrigger>
              <TabsTrigger value="goals">Metas Futuras</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpenseChart />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Desglose por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBreakdown />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Gastos</CardTitle>
                  <CardDescription>Todos tus gastos recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <BudgetOverview />
            </TabsContent>

            <TabsContent value="goals">
              <FutureGoals />
            </TabsContent>
          </Tabs>

          {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}

          {showIncomeForm && <IncomeForm onClose={() => setShowIncomeForm(false)} />}
        </>
      )}
    </div>
  )

  // Si el usuario está autenticado, mostrar el contenido protegido
  if (user) {
    return <ProtectedRoute>{content}</ProtectedRoute>
  }

  // Si no hay usuario, mostrar el contenido normal (se redirigirá en el componente ProtectedRoute)
  return content
}

function ExpenseList() {
  const { data } = useFinance()
  const { currency } = data

  // Ordenar gastos por fecha (más recientes primero)
  const sortedExpenses = [...data.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sortedExpenses.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No hay gastos registrados</p>
  }

  return (
    <div className="space-y-4">
      {sortedExpenses.map((expense) => (
        <div key={expense.id} className="flex justify-between py-2 border-b">
          <div>
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(expense.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <p className="font-medium">{formatCurrency(expense.amount, currency)}</p>
        </div>
      ))}
    </div>
  )
}
