// Tipos para la aplicación de finanzas
export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  notes?: string
  userId?: string
  createdAt?: Date
}

export interface Income {
  id: string
  description: string
  amount: number
  category: string
  date: string
  notes?: string
  userId?: string
  createdAt?: Date
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline: string
  userId?: string
  createdAt?: Date
}

export interface FinanceData {
  expenses: Expense[]
  incomes: Income[]
  goals: Goal[]
  monthlyExpenses: Record<string, number>
  categoryBreakdown: {
    name: string
    amount: number
    percent: number
    color: string
  }[]
  currency: Currency
  budgetRules: BudgetRule[]
  activeBudgetRuleId: string
}

export interface Currency {
  code: string
  symbol: string
  name: string
}

export interface BudgetRule {
  id: string
  name: string
  description?: string
  categories: {
    name: string
    percentage: number
    color: string
  }[]
  isDefault?: boolean
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "MXN", symbol: "$", name: "Peso mexicano" },
  { code: "COP", symbol: "$", name: "Peso colombiano" },
  { code: "ARS", symbol: "$", name: "Peso argentino" },
  { code: "CLP", symbol: "$", name: "Peso chileno" },
  { code: "PEN", symbol: "S/", name: "Sol peruano" },
  { code: "BOB", symbol: "Bs", name: "Boliviano" },
  { code: "UYU", symbol: "$", name: "Peso uruguayo" },
  { code: "PYG", symbol: "₲", name: "Guaraní paraguayo" },
  { code: "VES", symbol: "Bs.", name: "Bolívar soberano" },
  { code: "BRL", symbol: "R$", name: "Real brasileño" },
  { code: "GBP", symbol: "£", name: "Libra esterlina" },
  { code: "JPY", symbol: "¥", name: "Yen japonés" },
  { code: "CNY", symbol: "¥", name: "Yuan chino" },
]
