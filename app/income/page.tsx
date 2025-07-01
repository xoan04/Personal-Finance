"use client"
import DashboardLayout from "../dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useFinance } from "@/context/finance-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import MonthSelector from "@/components/month-selector"
import { useState } from "react"
import IncomeForm from "@/components/income-form"
import { Eye, Pencil, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Income } from "@/lib/types"

function IncomeList() {
  const { monthlyData, deleteIncome } = useFinance()
  const [selected, setSelected] = useState<Income | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Ordenar ingresos por fecha (más recientes primero)
  const sortedIncomes = [...monthlyData.incomes].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })

  if (!monthlyData.incomes.length) return <div className="text-sm text-gray-500">No hay ingresos registrados este mes.</div>
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
            {sortedIncomes.map(inc => (
              <tr key={inc.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{inc.description}</td>
                <td className="px-4 py-2 text-center text-sm text-gray-600">
                  {format(new Date(inc.date), "dd 'de' MMMM", { locale: es })}
                </td>
                <td className="px-4 py-2 text-right font-semibold text-green-600">${inc.amount.toLocaleString()}</td>
                <td className="px-2 py-2 text-center">
                  <Button size="icon" variant="ghost" onClick={() => { setSelected(inc); setShowDetail(true) }}><Eye className="w-4 h-4" /></Button>
                </td>
                <td className="px-2 py-2 text-center">
                  <Button size="icon" variant="ghost" onClick={() => { setSelected(inc); setShowEdit(true) }}><Pencil className="w-4 h-4" /></Button>
                </td>
                <td className="px-2 py-2 text-center">
                  <Button size="icon" variant="ghost" onClick={() => { setSelected(inc); setShowDelete(true) }}><Trash2 className="w-4 h-4" /></Button>
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
            <DialogTitle>Detalle del ingreso</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <div><b>Descripción:</b> {selected.description}</div>
              <div><b>Monto:</b> <span className="text-green-600 font-semibold">${selected.amount.toLocaleString()}</span></div>
              <div><b>Fecha:</b> {format(new Date(selected.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}</div>
              <div><b>Categoría:</b> {selected.category}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal editar */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar ingreso</DialogTitle>
          </DialogHeader>
          {selected && <IncomeForm editingIncome={selected} onClose={() => setShowEdit(false)} />}
        </DialogContent>
      </Dialog>
      {/* Modal eliminar */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar ingreso?</DialogTitle>
          </DialogHeader>
          <div className="mb-4">¿Seguro que deseas eliminar este ingreso?</div>
          <Button variant="destructive" onClick={async () => { if(selected) { await deleteIncome(selected.id); setShowDelete(false); } }}>Eliminar</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function IncomePage() {
  const { selectedMonth } = useFinance()
  const [showAddForm, setShowAddForm] = useState(false)
  
  const formatSelectedMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    return format(date, "MMMM 'de' yyyy", { locale: es })
  }
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MonthSelector />
          <h2 className="text-lg font-semibold">Ingresos</h2>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Ingreso
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos - {formatSelectedMonth()}</CardTitle>
          <CardDescription>Ingresos registrados en {formatSelectedMonth()}</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeList />
        </CardContent>
      </Card>
      
      {/* Modal para agregar nuevo ingreso */}
      {showAddForm && (
        <IncomeForm onClose={() => setShowAddForm(false)} />
      )}
    </DashboardLayout>
  )
} 