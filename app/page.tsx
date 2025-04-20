"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Expense, Income } from "@/lib/types"
import BudgetOverview from "@/components/budget-overview"
import { ExpenseForm } from "@/components/expense-form"
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
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Home() {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const { totalIncome, totalExpenses, balance, data, loading } = useFinance()
  const { user } = useAuth()

  const content = (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold truncate">Mi Presupuesto Personal</h1>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <CurrencySelector />
          <UserNav />
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 sm:h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm sm:text-base">Cargando tus datos financieros...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-lg">Ingresos Mensuales</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Total de ingresos este mes</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalIncome, data.currency)}</div>
                <Button variant="ghost" className="mt-1 text-xs sm:text-sm h-7 px-2 sm:h-10 sm:px-4" onClick={() => setShowIncomeForm(true)}>
                  <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Añadir ingreso
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-lg">Gastos Mensuales</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Total de gastos este mes</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, data.currency)}</div>
                <Button variant="ghost" className="mt-1 text-xs sm:text-sm h-7 px-2 sm:h-10 sm:px-4" onClick={() => setShowExpenseForm(true)}>
                  <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Añadir gasto
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-lg">Balance</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Dinero disponible</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className={`text-lg sm:text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(balance, data.currency)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  {totalIncome > 0
                    ? `${Math.round((balance / totalIncome) * 100)}% de tus ingresos`
                    : "0% de tus ingresos"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="mb-6">
            <div className="relative w-full mb-4">
              <div className="w-full overflow-x-auto scrollbar-none -mx-4 sm:mx-0 px-4 sm:px-0">
                <TabsList className="inline-flex min-w-full sm:min-w-0 sm:w-auto h-auto p-1 bg-muted/50 overflow-x-auto whitespace-nowrap scrollbar-none">
                  <TabsTrigger value="overview" className="text-sm px-2.5 py-1.5 flex-shrink-0">Resumen</TabsTrigger>
                  <TabsTrigger value="expenses" className="text-sm px-2.5 py-1.5 flex-shrink-0">Gastos</TabsTrigger>
                  <TabsTrigger value="income" className="text-sm px-2.5 py-1.5 flex-shrink-0">Ingresos</TabsTrigger>
                  <TabsTrigger value="budget" className="text-sm px-2.5 py-1.5 flex-shrink-0">Presupuesto</TabsTrigger>
                  <TabsTrigger value="goals" className="text-sm px-2.5 py-1.5 flex-shrink-0">Metas</TabsTrigger>
                </TabsList>
              </div>
            </div>

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

            <TabsContent value="income">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Ingresos</CardTitle>
                  <CardDescription>Todos tus ingresos recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeList />
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

          <footer className="mt-8 border-t pt-6 pb-8">
            <div className="container mx-auto px-4">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">¿Encontraste un error o tienes una sugerencia?</p>
                <div className="flex items-center justify-center gap-2">
                  <a
                    href="https://github.com/xoan04/Personal-Finance/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Reportar en GitHub
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href="mailto:ju4ng0m3zs@gmail.com"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    ju4ng0m3zs@gmail.com
                  </a>
                </div>
                <p className="mt-4 text-xs">
                  © {new Date().getFullYear()} Mi Presupuesto Personal. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )

  // Retornar el contenido directamente sin el ProtectedRoute
  return content
}

function ExpenseList() {
  const { data, updateExpense, deleteExpense } = useFinance()
  const { currency } = data
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Ordenar gastos por fecha (más recientes primero)
  const sortedExpenses = [...data.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowEditForm(true)
  }

  const handleShowDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDetailsDialog(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      toast({
        title: "Gasto eliminado",
        description: "El gasto ha sido eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar el gasto",
        variant: "destructive"
      })
    }
  }

  if (sortedExpenses.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No hay gastos registrados</p>
  }

  const categoryNames: Record<string, string> = {
    alimentacion: "Alimentación",
    transporte: "Transporte",
    servicios: "Servicios",
    entretenimiento: "Entretenimiento",
    salud: "Salud",
    ahorro: "Ahorro",
    otros: "Otros"
  }

  return (
    <div className="space-y-4">
      {sortedExpenses.map((expense) => (
        <div key={expense.id} className="flex items-center justify-between py-2 border-b">
          <div className="flex-grow">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(expense.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-red-600">{formatCurrency(expense.amount, currency)}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleShowDetails(expense)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <DeleteConfirmationDialog
                title="Eliminar Gasto"
                description={`¿Estás seguro de que deseas eliminar el gasto "${expense.description}"? Esta acción no se puede deshacer.`}
                onDelete={() => handleDelete(expense.id)}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      ))}

      {showEditForm && selectedExpense && (
        <ExpenseForm 
          onClose={() => {
            setShowEditForm(false)
            setSelectedExpense(null)
          }}
          editingExpense={selectedExpense}
        />
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Gasto</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-lg">{selectedExpense.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto</p>
                <p className="text-lg text-red-600">{formatCurrency(selectedExpense.amount, currency)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                <p className="text-lg">{new Date(selectedExpense.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                <p className="text-lg">{categoryNames[selectedExpense.category] || selectedExpense.category}</p>
              </div>
              {selectedExpense.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notas</p>
                  <p className="text-lg">{selectedExpense.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IncomeList() {
  const { data, updateIncome, deleteIncome } = useFinance()
  const { currency } = data
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Ordenar ingresos por fecha (más recientes primero)
  const sortedIncomes = [...data.incomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleEdit = (income: Income) => {
    setSelectedIncome(income)
    setShowEditForm(true)
  }

  const handleShowDetails = (income: Income) => {
    setSelectedIncome(income)
    setShowDetailsDialog(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id)
      toast({
        title: "Ingreso eliminado",
        description: "El ingreso ha sido eliminado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar el ingreso",
        variant: "destructive"
      })
    }
  }

  if (sortedIncomes.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No hay ingresos registrados</p>
  }

  const categoryNames: Record<string, string> = {
    salary: "Salario",
    freelance: "Trabajo freelance",
    investment: "Inversiones",
    gift: "Regalo",
    other: "Otros"
  }

  return (
    <div className="space-y-4">
      {sortedIncomes.map((income) => (
        <div key={income.id} className="flex items-center justify-between py-2 border-b">
          <div className="flex-grow">
            <p className="font-medium">{income.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(income.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-green-600">{formatCurrency(income.amount, currency)}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleShowDetails(income)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(income)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <DeleteConfirmationDialog
                title="Eliminar Ingreso"
                description={`¿Estás seguro de que deseas eliminar el ingreso "${income.description}"? Esta acción no se puede deshacer.`}
                onDelete={() => handleDelete(income.id)}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      ))}

      {showEditForm && selectedIncome && (
        <IncomeForm 
          onClose={() => {
            setShowEditForm(false)
            setSelectedIncome(null)
          }}
          editingIncome={selectedIncome}
        />
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Ingreso</DialogTitle>
          </DialogHeader>
          {selectedIncome && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-lg">{selectedIncome.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto</p>
                <p className="text-lg text-green-600">{formatCurrency(selectedIncome.amount, currency)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                <p className="text-lg">{new Date(selectedIncome.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                <p className="text-lg">{categoryNames[selectedIncome.category] || selectedIncome.category}</p>
              </div>
              {selectedIncome.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notas</p>
                  <p className="text-lg">{selectedIncome.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
