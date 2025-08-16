"use client"
import DashboardLayout from "../dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useFinance } from "@/context/finance-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import MonthSelector from "@/components/month-selector"

// Función para formatear fechas de forma segura
const formatDate = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida"
  }
  return format(dateObj, "dd 'de' MMMM", { locale: es })
}

const formatDateFull = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida"
  }
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: es })
}

import { useState } from "react"
import { ExpenseForm } from "@/components/expense-form"
import { Eye, Pencil, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Expense } from "@/lib/types"

function ExpenseList() {
  const { monthlyData, deleteExpense } = useFinance()
  const [selected, setSelected] = useState<Expense | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Ordenar gastos por fecha (más recientes primero)
  const sortedExpenses = [...monthlyData.expenses].sort((a, b) => {
    return b.date.getTime() - a.date.getTime()
  })

  if (!monthlyData.expenses.length) return <div className="text-sm text-gray-500">No hay gastos registrados este mes.</div>
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left font-semibold">Descripción</th>
              <th className="px-4 py-2 text-center font-semibold">Fecha</th>
              <th className="px-4 py-2 text-right font-semibold">Monto</th>
              <th className="px-2 py-2 text-center font-semibold">Ver</th>
              <th className="px-2 py-2 text-center font-semibold">Editar</th>
              <th className="px-2 py-2 text-center font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map(exp => (
              <tr key={exp.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{exp.description}</td>
                <td className="px-4 py-2 text-center text-sm text-gray-600">
                  {formatDate(exp.date)}
                </td>
                <td className="px-4 py-2 text-right font-semibold text-red-600">${exp.amount.toLocaleString()}</td>
                <td className="px-2 py-2 text-center">
                  <Button size="icon" variant="ghost" onClick={() => { setSelected(exp); setShowDetail(true) }}><Eye className="w-4 h-4" /></Button>
                </td>
                <td className="px-2 py-2 text-center">
                  <Button size="icon" variant="ghost" onClick={() => { setSelected(exp); setShowEdit(true) }}><Pencil className="w-4 h-4" /></Button>
                </td>
                <td className="px-2 py-2 text-center">
                  <Button size="icon" variant="ghost" onClick={() => { setSelected(exp); setShowDelete(true) }}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal detalle */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del gasto</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <div><b>Descripción:</b> {selected.description}</div>
              <div><b>Monto:</b> <span className="text-red-600 font-semibold">${selected.amount.toLocaleString()}</span></div>
              <div><b>Fecha:</b> {formatDateFull(selected.date)}</div>
              <div><b>Categoría:</b> {selected.category}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal editar */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar gasto</DialogTitle>
          </DialogHeader>
          {selected && <ExpenseForm editingExpense={selected} onClose={() => setShowEdit(false)} />}
        </DialogContent>
      </Dialog>
      {/* Modal eliminar */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar gasto?</DialogTitle>
          </DialogHeader>
          <div className="mb-4">¿Seguro que deseas eliminar este gasto?</div>
          <Button variant="destructive" onClick={async () => { if(selected) { await deleteExpense(selected.id); setShowDelete(false); } }}>Eliminar</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ExpensesPage() {
  const { selectedMonth } = useFinance()
  const [showAddForm, setShowAddForm] = useState(false)
  
  const formatSelectedMonth = () => {
    if (selectedMonth === "all") {
      return "Todos los meses"
    }
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return format(date, "MMMM 'de' yyyy", { locale: es })
  }
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MonthSelector />
          <h2 className="text-lg font-semibold">Gastos</h2>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Gasto
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos - {formatSelectedMonth()}</CardTitle>
          <CardDescription>Gastos registrados en {formatSelectedMonth()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList />
        </CardContent>
      </Card>
      
      {/* Modal para agregar nuevo gasto */}
      {showAddForm && (
        <ExpenseForm onClose={() => setShowAddForm(false)} />
      )}
    </DashboardLayout>
  )
} 