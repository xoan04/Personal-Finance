"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Currency, Expense, FinanceData, Goal, Income } from "@/lib/types"
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

        if (userDoc.exists()) {
          // Cargar datos básicos del usuario
          const userData = userDoc.data() as { currency: Currency }

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

          // Cargar metas
          const goalsQuery = query(collection(db, "goals"), where("userId", "==", user.uid))
          const goalsSnapshot = await getDocs(goalsQuery)
          const goals = goalsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Goal[]

          setData({
            ...initialData,
            expenses,
            incomes,
            goals,
            currency: userData.currency || initialData.currency,
          })
        } else {
          // Si el usuario es nuevo, crear su documento
          await setDoc(userDocRef, {
            currency: initialData.currency,
            createdAt: new Date(),
          })
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
      if (user) {
        // Guardar en Firestore
        const goalWithUser = {
          ...goal,
          userId: user.uid,
          createdAt: new Date(),
        }

        const docRef = await addDoc(collection(db, "goals"), goalWithUser)

        // Actualizar estado local
        const newGoal = {
          ...goalWithUser,
          id: docRef.id,
        } as Goal

        setData((prev) => ({
          ...prev,
          goals: [...prev.goals, newGoal],
        }))
      } else {
        // Guardar localmente
        const newGoal = {
          ...goal,
          id: Date.now().toString(),
        }

        setData((prev) => ({
          ...prev,
          goals: [...prev.goals, newGoal],
        }))
      }
    } catch (error) {
      console.error("Error al añadir meta:", error)
      throw error
    }
  }

  const updateGoal = async (goal: Goal) => {
    try {
      if (user) {
        // Actualizar en Firestore
        const goalRef = doc(db, "goals", goal.id)
        await updateDoc(goalRef, { ...goal })
      }

      // Actualizar estado local
      setData((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => (g.id === goal.id ? goal : g)),
      }))
    } catch (error) {
      console.error("Error al actualizar meta:", error)
      throw error
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      if (user) {
        // Eliminar de Firestore
        const goalRef = doc(db, "goals", id)
        await deleteDoc(goalRef)
      }

      // Actualizar estado local
      setData((prev) => ({
        ...prev,
        goals: prev.goals.filter((g) => g.id !== id),
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
