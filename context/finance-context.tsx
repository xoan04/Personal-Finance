"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
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
  currency: { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  budgetRules: [
    {
      id: "50-30-20",
      name: "Regla 50/30/20",
      description: "Distribución clásica para un presupuesto balanceado",
      categories: [
        { name: "Necesidades", percentage: 50, color: "#0ea5e9" },
        { name: "Deseos", percentage: 30, color: "#8b5cf6" },
        { name: "Ahorros", percentage: 20, color: "#10b981" }
      ],
      isDefault: true
    }
  ],
  activeBudgetRuleId: "50-30-20"
}

// Crear el contexto
type FinanceContextType = {
  data: FinanceData
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>
  addIncome: (income: Omit<Income, "id">) => Promise<void>
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
  updateBudgetRule: (id: string, updates: Partial<BudgetRule>) => void
  deleteBudgetRule: (id: string) => void
  setActiveBudgetRule: (id: string) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// Proveedor del contexto
export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FinanceData>(initialData)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Cargar datos de Firestore cuando el usuario inicia sesión
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // Si no hay usuario, usar datos locales
        const savedData = localStorage.getItem("financeData")
        if (savedData) {
          try {
            setData(JSON.parse(savedData))
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

        if (userDoc.exists()) {
          // Cargar datos básicos del usuario
          const userData = userDoc.data() as { currency: Currency; activeBudgetRuleId: string }

          // Cargar gastos
          const expensesQuery = query(collection(db, "expenses"), where("userId", "==", user.uid))
          const expensesSnapshot = await getDocs(expensesQuery)
          const expenses = expensesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Expense[]

          // Cargar ingresos
          const incomesQuery = query(collection(db, "incomes"), where("userId", "==", user.uid))
          const incomesSnapshot = await getDocs(incomesQuery)
          const incomes = incomesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Income[]

          setData({
            ...initialData,
            expenses,
            incomes,
            goals: userGoals,
            currency: userData.currency || initialData.currency,
            budgetRules: [...initialData.budgetRules, ...customBudgetRules],
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

  // Calcular totales
  const totalIncome = data.incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = totalIncome - totalExpenses

  // Actualizar desglose por categoría cuando cambian los gastos
  useEffect(() => {
    // Agrupar gastos por categoría
    const categories: Record<string, { amount: number; color: string }> = {
      housing: { amount: 0, color: "bg-blue-500" },
      food: { amount: 0, color: "bg-green-500" },
      transport: { amount: 0, color: "bg-yellow-500" },
      utilities: { amount: 0, color: "bg-purple-500" },
      entertainment: { amount: 0, color: "bg-pink-500" },
      health: { amount: 0, color: "bg-red-500" },
      other: { amount: 0, color: "bg-gray-500" },
    }

    // Mapeo de categorías en español
    const categoryNames: Record<string, string> = {
      housing: "Vivienda",
      food: "Alimentación",
      transport: "Transporte",
      utilities: "Servicios",
      entertainment: "Entretenimiento",
      health: "Salud",
      other: "Otros",
    }

    // Agrupar gastos por categoría
    data.expenses.forEach((expense) => {
      if (categories[expense.category]) {
        categories[expense.category].amount += expense.amount
      } else {
        categories.other.amount += expense.amount
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

    // Actualizar datos de gastos mensuales
    const monthlyData: Record<string, number> = {}

    // Inicializar los últimos 6 meses
    const today = new Date()
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = monthNames[month.getMonth()]
      monthlyData[monthKey] = 0
    }

    // Sumar gastos por mes
    data.expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = monthNames[date.getMonth()]
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += expense.amount
      }
    })

    setData((prev) => ({
      ...prev,
      categoryBreakdown,
      monthlyExpenses: monthlyData,
    }))
  }, [data.expenses, totalExpenses])

  // Funciones para manipular datos
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      if (user) {
        // Guardar en Firestore
        const expenseWithUser = {
          ...expense,
          userId: user.uid,
          createdAt: new Date(),
        }

        const docRef = await addDoc(collection(db, "expenses"), expenseWithUser)

        // Actualizar estado local
        const newExpense = {
          ...expenseWithUser,
          id: docRef.id,
        } as Expense

        setData((prev) => ({
          ...prev,
          expenses: [...prev.expenses, newExpense],
        }))
      } else {
        // Guardar localmente
        const newExpense = {
          ...expense,
          id: Date.now().toString(),
        }

        setData((prev) => ({
          ...prev,
          expenses: [...prev.expenses, newExpense],
        }))
      }
    } catch (error) {
      console.error("Error al añadir gasto:", error)
      throw error
    }
  }

  const addIncome = async (income: Omit<Income, "id">) => {
    try {
      if (user) {
        // Guardar en Firestore
        const incomeWithUser = {
          ...income,
          userId: user.uid,
          createdAt: new Date(),
        }

        const docRef = await addDoc(collection(db, "incomes"), incomeWithUser)

        // Actualizar estado local
        const newIncome = {
          ...incomeWithUser,
          id: docRef.id,
        } as Income

        setData((prev) => ({
          ...prev,
          incomes: [...prev.incomes, newIncome],
        }))
      } else {
        // Guardar localmente
        const newIncome = {
          ...income,
          id: Date.now().toString(),
        }

        setData((prev) => ({
          ...prev,
          incomes: [...prev.incomes, newIncome],
        }))
      }
    } catch (error) {
      console.error("Error al añadir ingreso:", error)
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

      await updateGoal(updatedGoal)
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
      const newRule = {
        ...rule,
        id: Date.now().toString(),
      }

      if (user) {
        // Obtener reglas actuales
        const budgetRulesRef = doc(db, "budgetRules", user.uid)
        const budgetRulesDoc = await getDoc(budgetRulesRef)
        
        if (budgetRulesDoc.exists()) {
          const currentRules = budgetRulesDoc.data().rules || []
          await updateDoc(budgetRulesRef, {
            rules: [...currentRules, newRule],
            updatedAt: new Date()
          })
        } else {
          // Si el documento no existe, lo creamos
          await setDoc(budgetRulesRef, {
            rules: [newRule],
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        budgetRules: [...prev.budgetRules, newRule]
      }))
    } catch (error) {
      console.error("Error al añadir regla de presupuesto:", error)
      throw error
    }
  }

  const updateBudgetRule = async (id: string, updates: Partial<BudgetRule>) => {
    try {
      if (user) {
        const budgetRulesRef = doc(db, "budgetRules", user.uid)
        const budgetRulesDoc = await getDoc(budgetRulesRef)
        
        if (budgetRulesDoc.exists()) {
          const currentRules = budgetRulesDoc.data().rules || []
          const updatedRules = currentRules.map((rule: BudgetRule) => 
            rule.id === id ? { ...rule, ...updates } : rule
          )
          
          await updateDoc(budgetRulesRef, {
            rules: updatedRules,
            updatedAt: new Date()
          })
        } else {
          // Si el documento no existe, lo creamos con la regla actualizada
          const defaultRules = data.budgetRules.map((rule: BudgetRule) =>
            rule.id === id ? { ...rule, ...updates } : rule
          )
          await setDoc(budgetRulesRef, {
            rules: defaultRules,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        budgetRules: prev.budgetRules.map(rule => 
          rule.id === id ? { ...rule, ...updates } : rule
        )
      }))
    } catch (error) {
      console.error("Error al actualizar regla de presupuesto:", error)
      throw error
    }
  }

  const deleteBudgetRule = async (id: string) => {
    try {
      if (user) {
        const budgetRulesRef = doc(db, "budgetRules", user.uid)
        const budgetRulesDoc = await getDoc(budgetRulesRef)
        
        if (budgetRulesDoc.exists()) {
          const currentRules = budgetRulesDoc.data().rules || []
          const updatedRules = currentRules.filter((rule: BudgetRule) => rule.id !== id)
          
          await updateDoc(budgetRulesRef, {
            rules: updatedRules,
            updatedAt: new Date()
          })
        } else {
          // Si el documento no existe, lo creamos con las reglas actuales menos la eliminada
          const defaultRules = data.budgetRules.filter(rule => rule.id !== id)
          await setDoc(budgetRulesRef, {
            rules: defaultRules,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }

      setData(prev => ({
        ...prev,
        budgetRules: prev.budgetRules.filter(rule => rule.id !== id),
        activeBudgetRuleId: prev.activeBudgetRuleId === id ? "50-30-20" : prev.activeBudgetRuleId
      }))
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
        addExpense,
        addIncome,
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
