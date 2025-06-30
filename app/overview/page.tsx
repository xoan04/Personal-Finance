"use client"
import DashboardLayout from "../dashboard-layout"
import MonthlyCategoryBreakdown from "@/components/monthly-category-breakdown"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState, useEffect } from "react"
import { ExpenseForm } from "@/components/expense-form"
import IncomeForm from "@/components/income-form"
import { PlusCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import MonthSelector from "@/components/month-selector"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function OverviewPage() {
  const { totalIncome, totalExpenses, balance, data, monthlyData, selectedMonth } = useFinance()
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular tiempo de carga para mostrar las animaciones
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const formatSelectedMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return format(date, "MMMM 'de' yyyy", { locale: es })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container w-full mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-muted-foreground">Cargando datos...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shadow-sm border rounded-lg p-4">
                <SkeletonCard lines={2} height="h-4" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="shadow-sm border rounded-lg p-4">
                <SkeletonCard lines={3} height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
        <MonthSelector />
      </div>
      <div className="container w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {formatSelectedMonth()}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Balance y transacciones del mes seleccionado
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="shadow-sm border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-sm sm:text-lg font-bold text-green-800">Ingresos del Mes</div>
            </div>
            <div className="text-xs sm:text-sm mb-3 text-green-700">Total de ingresos en {formatSelectedMonth()}</div>
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-3">
              <AnimatedCounter 
                value={totalIncome} 
                currency={data.currency}
                duration={2000}
                delay={400}
              />
            </div>
            <button 
              className="mt-2 flex items-center gap-1 text-sm text-green-700 hover:text-green-800 transition-colors duration-200" 
              onClick={() => setShowIncomeForm(true)}
            >
              <PlusCircle className="h-4 w-4" /> Añadir ingreso
            </button>
          </div>
          
          <div className="shadow-sm border rounded-lg p-4 bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div className="text-sm sm:text-lg font-bold text-red-800">Gastos del Mes</div>
            </div>
            <div className="text-xs sm:text-sm mb-3 text-red-700">Total de gastos en {formatSelectedMonth()}</div>
            <div className="text-lg sm:text-2xl font-bold text-red-600 mb-3">
              <AnimatedCounter 
                value={totalExpenses} 
                currency={data.currency}
                duration={2000}
                delay={600}
              />
            </div>
            <button 
              className="mt-2 flex items-center gap-1 text-sm text-red-700 hover:text-red-800 transition-colors duration-200" 
              onClick={() => setShowExpenseForm(true)}
            >
              <PlusCircle className="h-4 w-4" /> Añadir gasto
            </button>
          </div>
          
          <div className="shadow-sm border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <div className="text-sm sm:text-lg font-bold text-blue-800">Balance del Mes</div>
            </div>
            <div className="text-xs sm:text-sm mb-3 text-blue-700">Balance en {formatSelectedMonth()}</div>
            <div className={`text-lg sm:text-2xl font-bold mb-3 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <AnimatedCounter 
                value={Math.abs(balance)} 
                currency={data.currency}
                duration={2000}
                delay={800}
                prefix={balance < 0 ? '-' : ''}
              />
            </div>
            <p className={`text-xs font-medium ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {balance >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="shadow-sm border rounded-lg p-4 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="font-bold mb-2">Gastos por Categoría</div>
            <div className="text-xs mb-2 text-muted-foreground">Distribución de gastos en {formatSelectedMonth()}</div>
            <MonthlyCategoryBreakdown />
          </div>
          
          <div className="shadow-sm border rounded-lg p-4 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="font-bold mb-2">Resumen del Mes</div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                <span className="text-sm font-medium text-green-800">Ingresos totales:</span>
                <span className="text-green-600 font-semibold">
                  <AnimatedCounter 
                    value={totalIncome} 
                    currency={data.currency}
                    duration={1500}
                    delay={1000}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-red-50">
                <span className="text-sm font-medium text-red-800">Gastos totales:</span>
                <span className="text-red-600 font-semibold">
                  <AnimatedCounter 
                    value={totalExpenses} 
                    currency={data.currency}
                    duration={1500}
                    delay={1200}
                  />
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                  <span className="text-sm font-medium text-blue-800">Balance:</span>
                  <span className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <AnimatedCounter 
                      value={Math.abs(balance)} 
                      currency={data.currency}
                      duration={1500}
                      delay={1400}
                      prefix={balance < 0 ? '-' : ''}
                    />
                  </span>
                </div>
              </div>
              {totalIncome > 0 && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50">
                  <span className="text-sm font-medium text-purple-800">Porcentaje de ahorro:</span>
                  <span className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <AnimatedCounter 
                      value={Math.abs((balance / totalIncome) * 100)} 
                      showCurrency={false}
                      decimals={1}
                      duration={1500}
                      delay={1600}
                      suffix="%"
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
      {showIncomeForm && <IncomeForm onClose={() => setShowIncomeForm(false)} />}
    </DashboardLayout>
  )
} 