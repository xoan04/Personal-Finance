"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import type { Currency, Expense, FinanceData, Goal, Income, BudgetRule } from "@/lib/types"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore"

// Datos iniciales vacíos
const initialData: FinanceData = {
  expenses: [],
  incomes: [],
  goals: [],
  monthlyExpenses: {},
  categoryBreakdown: [],
  currency: { code: "COP", symbol: "$", name: "Peso Colombiano" },
  budgetRules: [
    {
      id: "50-30-20",
      name: "Regla 50/30/20",
      description: "La regla 50/30/20 es un método simple para presupuestar y ahorrar dinero, que divide los ingresos en tres categorías: 50% para necesidades básicas, 30% para deseos y 20% para ahorros.",
      categories: [
        {
          name: "Necesidades",
          percentage: 50,
          color: "#0ea5e9",
          description: "50% de tus ingresos para necesidades básicas como vivienda, alimentación, servicios públicos, transporte y gastos médicos esenciales."
        },
        {
          name: "Deseos",
          percentage: 30,
          color: "#8b5cf6",
          description: "30% para gastos no esenciales como entretenimiento, compras discrecionales, salidas a comer y hobbies."
        },
        {
          name: "Ahorros",
          percentage: 20,
          color: "#10b981",
          description: "20% destinado a ahorros, inversiones, fondo de emergencia y metas financieras a largo plazo."
        }
      ],
      isDefault: true
    }
  ],
  activeBudgetRuleId: "50-30-20"
}

// Crear el contexto
type FinanceContextType = {
  data: FinanceData
  monthlyData: {
    expenses: Expense[]
    incomes: Income[]
    goals: Goal[]
  }
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>
  updateExpense: (expense: Expense) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  addIncome: (income: Omit<Income, "id">) => Promise<void>
  updateIncome: (income: Income) => Promise<void>
  deleteIncome: (id: string) => Promise<void>
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>
  updateGoal: (goal: Goal) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addFundsToGoal: (id: string, amount: number) => Promise<void>
  changeCurrency: (currency: Currency) => Promise<void>
  totalIncome: number
  totalExpenses: number
  balance: number
  loading: boolean
  addBudgetRule: (rule: Omit<BudgetRule, "id">) => void
  updateBudgetRule: (rule: BudgetRule) => void
  deleteBudgetRule: (id: string) => void
  setActiveBudgetRule: (id: string) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// Proveedor del contexto
export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<FinanceData>(initialData)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return monthString
  })

  // Wrapper para setSelectedMonth con logging
  const setSelectedMonthWithLog = (month: string) => {
    setSelectedMonth(month)
  }

  // Función para obtener el primer y último día del mes seleccionado
  const getMonthRange = (monthString: string) => {
    const [year, month] = monthString.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999) // month (no month-1) para obtener el último día del mes
    return { startDate, endDate }
  }

  // Función para filtrar transacciones por mes
  const filterTransactionsByMonth = (transactions: any[], monthString: string) => {
    const [year, month] = monthString.split('-').map(Number)
    return transactions.filter(transaction => {
      const [tYear, tMonth] = transaction.date.split('-').map(Number)
      return tYear === year && tMonth === month
    })
  }

  // Datos filtrados por mes
  const monthlyData = useMemo(() => {
    return {
      expenses: filterTransactionsByMonth(data.expenses, selectedMonth),
      incomes: filterTransactionsByMonth(data.incomes, selectedMonth),
      goals: data.goals, // Las metas no se filtran por mes
    }
  }, [data.expenses, data.incomes, data.goals, selectedMonth])

  // Calcular totales del mes seleccionado
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = monthlyData.incomes.reduce((sum, income) => sum + income.amount, 0)
    const expenses = monthlyData.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const balance = income - expenses
    return { totalIncome: income, totalExpenses: expenses, balance }
  }, [monthlyData.incomes, monthlyData.expenses])

  // Cargar datos de Firestore cuando el usuario inicia sesión
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // Si no hay usuario, usar datos locales
        const savedData = localStorage.getItem("financeData")
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData)
            // Asegurar que la regla 50/30/20 esté presente
            if (!parsedData.budgetRules.some((rule: BudgetRule) => rule.id === "50-30-20")) {
              parsedData.budgetRules.unshift(initialData.budgetRules[0])
            }
            setData(parsedData)
          } catch (error) {
            console.error("Error al cargar datos locales:", error)
          }
        }
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Referencia al documento del usuario
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        // Cargar reglas de presupuesto del usuario
        const budgetRulesDoc = await getDoc(doc(db, "budgetRules", user.uid))
        const customBudgetRules = budgetRulesDoc.exists()
          ? (budgetRulesDoc.data().rules as BudgetRule[])
          : []

        // Cargar metas del usuario
        const goalsDoc = await getDoc(doc(db, "goals", user.uid))
        const userGoals = goalsDoc.exists()
          ? (goalsDoc.data().goals as Goal[])
          : []

        // Cargar transacciones del usuario
        const transactionsDoc = await getDoc(doc(db, "transactions", user.uid))
        const userTransactions = transactionsDoc.exists()
          ? transactionsDoc.data()
          : { expenses: [], incomes: [] }

        if (userDoc.exists()) {
          // Cargar datos básicos del usuario
          const userData = userDoc.data() as { currency: Currency; activeBudgetRuleId: string }

          setData({
            ...initialData,
            expenses: userTransactions.expenses || [],
            incomes: userTransactions.incomes || [],
            goals: userGoals,
            currency: userData.currency || initialData.currency,
            budgetRules: [initialData.budgetRules[0], ...customBudgetRules],
            activeBudgetRuleId: userData.activeBudgetRuleId || initialData.activeBudgetRuleId,
          })
        } else {
          // Si el usuario es nuevo, crear sus documentos
          await Promise.all([
            setDoc(userDocRef, {
              currency: initialData.currency,
              activeBudgetRuleId: initialData.activeBudgetRuleId,
              createdAt: new Date(),
            }),
            setDoc(doc(db, "budgetRules", user.uid), {
              rules: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }),
            setDoc(doc(db, "goals", user.uid), {
              goals: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }),
            setDoc(doc(db, "transactions", user.uid), {
              expenses: [],
              incomes: [],
              createdAt: new Date(),
              updatedAt: new Date()
            })
          ])
          setData(initialData)
        }
      } catch (error) {
        console.error("Error al cargar datos de Firestore:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Actualizar datos locales cuando cambian los datos
  useEffect(() => {
    if (!user) {
      localStorage.setItem("financeData", JSON.stringify(data))
    }
  }, [data, user])

  // Actualizar desglose por categoría cuando cambian los gastos
  useEffect(() => {
    // Agrupar gastos por categoría
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

    // Agrupar gastos por categoría (usando todos los datos, no solo el mes seleccionado)
    data.expenses.forEach((expense) => {
      const categoryKey = expense.category.toLowerCase()
      if (categories[categoryKey]) {
        categories[categoryKey].amount += expense.amount
      } else {
        categories.otros.amount += expense.amount
      }
    })

    // Convertir a array y calcular porcentajes
    const categoryBreakdown = Object.entries(categories)
      .map(([key, { amount, color }]) => ({
        name: categoryNames[key] || key,
        amount,
        percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color,
      }))
      .filter((category) => category.amount > 0)
      .sort((a, b) => b.amount - a.amount)

    // Actualizar datos de gastos mensuales (mantener para compatibilidad)
    const monthlyExpensesData: Record<string, number> = {}

    // Inicializar los últimos 6 meses
    const today = new Date()
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${monthNames[month.getMonth()]} ${month.getFullYear()}`
      monthlyExpensesData[monthKey] = 0
    }

    // Sumar gastos por mes (usando todos los datos, no solo el mes seleccionado)
    data.expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      if (monthlyExpensesData[monthKey] !== undefined) {
        monthlyExpensesData[monthKey] += expense.amount
      }
    })

    setData((prev) => ({
      ...prev,
      categoryBreakdown,
      monthlyExpenses: monthlyExpensesData,
    }))
  }, [data.expenses])

  // Funciones para manipular datos
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const newExpense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date(),
      }

      if (user) {
        const transactionsRef = doc(db, "transactions", user.uid)
        const transactionsDoc = await getDoc(transactionsRef)

        if (transactionsDoc.exists()) {
          const currentExpenses = transactionsDoc.data().expenses || []
          await updateDoc(transactionsRef, {
            expenses: [...currentExpenses, newExpense],
            updatedAt: new Date()
          })
        } else {
          await setDoc(transactionsRef, {
            expenses: [newExpense],
            incomes: [],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        expenses: [...prev.expenses, newExpense],
      }))
    } catch (error) {
      console.error("Error al añadir gasto:", error)
      throw error
    }
  }

  const updateExpense = async (expenseToUpdate: Expense) => {
    try {
      // Buscar el gasto original
      const originalExpense = data.expenses.find(e => e.id === expenseToUpdate.id)

      if (user) {
        const transactionsRef = doc(db, "transactions", user.uid)
        const transactionsDoc = await getDoc(transactionsRef)

        if (transactionsDoc.exists()) {
          const currentExpenses = transactionsDoc.data().expenses || []
          const updatedExpenses = currentExpenses.map((expense: Expense) =>
            expense.id === expenseToUpdate.id ? expenseToUpdate : expense
          )

          await updateDoc(transactionsRef, {
            expenses: updatedExpenses,
            updatedAt: new Date()
          })
        }
      }

      // Si el gasto está relacionado con una meta y ha cambiado el monto
      if (originalExpense?.category === "ahorro" && originalExpense?.notes?.includes("Fondos para meta:")) {
        const goalTitle = originalExpense.notes.split("Fondos para meta:")[1].trim()
        const goal = data.goals.find(g => g.title === goalTitle)
        
        if (goal) {
          // Si se cambió la categoría o se cambió el monto
          if (expenseToUpdate.category !== "ahorro" || expenseToUpdate.amount !== originalExpense.amount) {
            const updatedGoal = {
              ...goal,
              currentAmount: goal.currentAmount - originalExpense.amount + (expenseToUpdate.category === "ahorro" ? expenseToUpdate.amount : 0)
            }
            await updateGoal(updatedGoal)
          }
        }
      }

      setData(prev => ({
        ...prev,
        expenses: prev.expenses.map(expense =>
          expense.id === expenseToUpdate.id ? expenseToUpdate : expense
        ),
      }))
    } catch (error) {
      console.error("Error al actualizar gasto:", error)
      throw error
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      // Buscar el gasto antes de eliminarlo
      const expenseToDelete = data.expenses.find(e => e.id === id)

      if (!expenseToDelete) return

      // Si el gasto estaba relacionado con una meta, actualizar la meta primero
      if (expenseToDelete.category === "ahorro" && expenseToDelete.notes?.includes("Fondos para meta:")) {
        const goalTitle = expenseToDelete.notes.split("Fondos para meta:")[1].trim()
        const goal = data.goals.find(g => g.title === goalTitle)
        
        if (goal) {
          const updatedGoal = {
            ...goal,
            currentAmount: Math.max(0, goal.currentAmount - expenseToDelete.amount) // Asegurar que no sea negativo
          }
          // Actualizar la meta primero
          await updateGoal(updatedGoal)
        }
      }

      // Luego actualizar Firestore
      if (user) {
        const transactionsRef = doc(db, "transactions", user.uid)
        const transactionsDoc = await getDoc(transactionsRef)

        if (transactionsDoc.exists()) {
          const currentExpenses = transactionsDoc.data().expenses || []
          const updatedExpenses = currentExpenses.filter((expense: Expense) => expense.id !== id)

          await updateDoc(transactionsRef, {
            expenses: updatedExpenses,
            updatedAt: new Date()
          })
        }
      }

      // Finalmente actualizar el estado local
      setData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(expense => expense.id !== id),
      }))

    } catch (error) {
      console.error("Error al eliminar gasto:", error)
      throw error
    }
  }

  const addIncome = async (income: Omit<Income, "id">) => {
    try {
      const newIncome = {
        ...income,
        id: Date.now().toString(),
        createdAt: new Date(),
      }

      if (user) {
        const transactionsRef = doc(db, "transactions", user.uid)
        const transactionsDoc = await getDoc(transactionsRef)

        if (transactionsDoc.exists()) {
          const currentIncomes = transactionsDoc.data().incomes || []
          await updateDoc(transactionsRef, {
            incomes: [...currentIncomes, newIncome],
            updatedAt: new Date()
          })
        } else {
          await setDoc(transactionsRef, {
            expenses: [],
            incomes: [newIncome],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        incomes: [...prev.incomes, newIncome],
      }))
    } catch (error) {
      console.error("Error al añadir ingreso:", error)
      throw error
    }
  }

  const updateIncome = async (incomeToUpdate: Income) => {
    try {
      if (user) {
        const transactionsRef = doc(db, "transactions", user.uid)
        const transactionsDoc = await getDoc(transactionsRef)

        if (transactionsDoc.exists()) {
          const currentIncomes = transactionsDoc.data().incomes || []
          const updatedIncomes = currentIncomes.map((income: Income) =>
            income.id === incomeToUpdate.id ? incomeToUpdate : income
          )

          await updateDoc(transactionsRef, {
            incomes: updatedIncomes,
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        incomes: prev.incomes.map(income =>
          income.id === incomeToUpdate.id ? incomeToUpdate : income
        ),
      }))
    } catch (error) {
      console.error("Error al actualizar ingreso:", error)
      throw error
    }
  }

  const deleteIncome = async (id: string) => {
    try {
      if (user) {
        const transactionsRef = doc(db, "transactions", user.uid)
        const transactionsDoc = await getDoc(transactionsRef)

        if (transactionsDoc.exists()) {
          const currentIncomes = transactionsDoc.data().incomes || []
          const updatedIncomes = currentIncomes.filter((income: Income) => income.id !== id)

          await updateDoc(transactionsRef, {
            incomes: updatedIncomes,
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        incomes: prev.incomes.filter(income => income.id !== id),
      }))
    } catch (error) {
      console.error("Error al eliminar ingreso:", error)
      throw error
    }
  }

  const addGoal = async (goal: Omit<Goal, "id">) => {
    try {
      const newGoal = {
        ...goal,
        id: Date.now().toString(),
      }

      if (user) {
        const goalsRef = doc(db, "goals", user.uid)
        const goalsDoc = await getDoc(goalsRef)

        if (goalsDoc.exists()) {
          const currentGoals = goalsDoc.data().goals || []
          await updateDoc(goalsRef, {
            goals: [...currentGoals, newGoal],
            updatedAt: new Date()
          })
        } else {
          await setDoc(goalsRef, {
            goals: [newGoal],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }))
    } catch (error) {
      console.error("Error al añadir meta:", error)
      throw error
    }
  }

  const updateGoal = async (goalToUpdate: Goal) => {
    try {
      if (user) {
        const goalsRef = doc(db, "goals", user.uid)
        const goalsDoc = await getDoc(goalsRef)

        if (goalsDoc.exists()) {
          const currentGoals = goalsDoc.data().goals || []
          const updatedGoals = currentGoals.map((goal: Goal) =>
            goal.id === goalToUpdate.id ? goalToUpdate : goal
          )

          await updateDoc(goalsRef, {
            goals: updatedGoals,
            updatedAt: new Date()
          })
        } else {
          await setDoc(goalsRef, {
            goals: [goalToUpdate],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === goalToUpdate.id ? goalToUpdate : g),
      }))
    } catch (error) {
      console.error("Error al actualizar meta:", error)
      throw error
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      if (user) {
        const goalsRef = doc(db, "goals", user.uid)
        const goalsDoc = await getDoc(goalsRef)

        if (goalsDoc.exists()) {
          const currentGoals = goalsDoc.data().goals || []
          const updatedGoals = currentGoals.filter((goal: Goal) => goal.id !== id)

          await updateDoc(goalsRef, {
            goals: updatedGoals,
            updatedAt: new Date()
          })
        } else {
          await setDoc(goalsRef, {
            goals: [],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id),
      }))
    } catch (error) {
      console.error("Error al eliminar meta:", error)
      throw error
    }
  }

  const addFundsToGoal = async (id: string, amount: number) => {
    try {
      const goalToUpdate = data.goals.find((g) => g.id === id)
      if (!goalToUpdate) return

      const updatedGoal = {
        ...goalToUpdate,
        currentAmount: goalToUpdate.currentAmount + amount,
      }

      // Crear un gasto correspondiente a los fondos añadidos
      const expenseData = {
        description: `Fondos para meta: ${goalToUpdate.title}`,
        amount: amount,
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD consistente
        category: "ahorro",
        notes: `Fondos para meta: ${goalToUpdate.title}`, // Formato consistente para identificar la meta
      }

      // Actualizar la meta y añadir el gasto
      await Promise.all([
        updateGoal(updatedGoal),
        addExpense(expenseData)
      ])

    } catch (error) {
      console.error("Error al añadir fondos a la meta:", error)
      throw error
    }
  }

  const changeCurrency = async (currency: Currency) => {
    try {
      if (user) {
        // Actualizar en Firestore
        const userDocRef = doc(db, "users", user.uid)
        await updateDoc(userDocRef, { currency })
      }

      // Actualizar estado local
      setData((prev) => ({
        ...prev,
        currency,
      }))
    } catch (error) {
      console.error("Error al cambiar moneda:", error)
      throw error
    }
  }

  const addBudgetRule = async (rule: Omit<BudgetRule, "id">) => {
    try {
      const newRule: BudgetRule = {
        ...rule,
        id: Date.now().toString(),
        isDefault: rule.isDefault ?? false, // 👈 Asegura que no quede undefined
        createdAt: new Date(),
        updatedAt: new Date()
      }
  
      if (user) {
        const budgetRulesRef = doc(db, "budgetRules", user.uid)
        const budgetRulesDoc = await getDoc(budgetRulesRef)
  
        if (budgetRulesDoc.exists()) {
          const currentRules = budgetRulesDoc.data().rules || []
          await updateDoc(budgetRulesRef, {
            rules: [...currentRules, newRule],
            updatedAt: new Date()
          })
        } else {
          await setDoc(budgetRulesRef, {
            rules: [newRule],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }
  
      setData(prev => ({
        ...(prev || initialData),
        budgetRules: [...((prev || initialData).budgetRules || []), newRule]
      }))
    } catch (error) {
      console.error("Error al añadir regla de presupuesto:", error)
      throw error
    }
  }
  

  const updateBudgetRule = async (updatedRule: BudgetRule) => {
    try {
      if (user) {
        const budgetRulesRef = doc(db, "budgetRules", user.uid)
        const budgetRulesDoc = await getDoc(budgetRulesRef)
  
        if (budgetRulesDoc.exists()) {
          const currentRules = budgetRulesDoc.data().rules || []
  
          const updatedRules = currentRules.map((rule: BudgetRule) =>
            rule.id === updatedRule.id ? updatedRule : rule
          )
  
          const hasInvalid = updatedRules.some((rule: BudgetRule) =>
            rule === undefined || Object.values(rule).some((v) => v === undefined)
          )
  
          if (hasInvalid) {
            throw new Error("No se puede actualizar con reglas inválidas")
          }
  
          await updateDoc(budgetRulesRef, {
            rules: updatedRules,
            updatedAt: new Date()
          })
        } else {
          await setDoc(budgetRulesRef, {
            rules: [updatedRule],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }
  
      setData(prev => ({
        ...(prev || initialData),
        budgetRules: ((prev || initialData).budgetRules || []).map((rule: BudgetRule) =>
          rule.id === updatedRule.id ? { ...updatedRule, updatedAt: new Date() } : rule
        )
      }))
    } catch (error) {
      console.error("🚨 Error al actualizar regla de presupuesto:", error)
      throw error
    }
  }
  


  const deleteBudgetRule = async (ruleId: string) => {
    try {
      // Prevenir la eliminación de la regla por defecto
      if (ruleId === "50-30-20") {
        return
      }

      if (user) {
        const budgetRulesRef = doc(db, "budgetRules", user.uid)
        const budgetRulesDoc = await getDoc(budgetRulesRef)

        if (budgetRulesDoc.exists()) {
          const currentRules = budgetRulesDoc.data().rules || []
          const updatedRules = currentRules.filter((rule: BudgetRule) => rule.id !== ruleId)

          await updateDoc(budgetRulesRef, {
            rules: updatedRules,
            updatedAt: new Date()
          })
        }
      }

      setData(prev => {
        const updatedRules = ((prev || initialData).budgetRules || []).filter(
          (rule: BudgetRule) => rule.id !== ruleId
        )

        // Asegurar que la regla 50/30/20 siempre esté presente
        if (!updatedRules.some(rule => rule.id === "50-30-20")) {
          updatedRules.unshift(initialData.budgetRules[0])
        }

        return {
          ...(prev || initialData),
          budgetRules: updatedRules,
          // Si la regla activa es la que se está eliminando, cambiar a la regla por defecto
          activeBudgetRuleId: prev.activeBudgetRuleId === ruleId ? "50-30-20" : prev.activeBudgetRuleId
        }
      })
    } catch (error) {
      console.error("Error al eliminar regla de presupuesto:", error)
      throw error
    }
  }

  const setActiveBudgetRule = async (id: string) => {
    try {
      if (user) {
        // Actualizar en Firestore
        const userDocRef = doc(db, "users", user.uid)
        await updateDoc(userDocRef, { activeBudgetRuleId: id })
      }

      setData(prev => ({
        ...prev,
        activeBudgetRuleId: id
      }))
    } catch (error) {
      console.error("Error al cambiar regla de presupuesto activa:", error)
      throw error
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        data,
        monthlyData,
        selectedMonth,
        setSelectedMonth: setSelectedMonthWithLog,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addGoal,
        updateGoal,
        deleteGoal,
        addFundsToGoal,
        changeCurrency,
        totalIncome,
        totalExpenses,
        balance,
        loading,
        addBudgetRule,
        updateBudgetRule,
        deleteBudgetRule,
        setActiveBudgetRule
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// Hook para usar el contexto
export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance debe ser usado dentro de un FinanceProvider")
  }
  return context
}
