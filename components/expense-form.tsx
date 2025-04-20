"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  notes?: string
}

export interface ExpenseFormProps {
  onClose?: () => void
  editingExpense?: Expense
}

export function ExpenseForm({ onClose, editingExpense }: ExpenseFormProps) {
  const { addExpense, updateExpense, data } = useFinance()
  const { currency } = data
  const [date, setDate] = useState(
    editingExpense?.date 
      ? new Date(editingExpense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  )
  const [description, setDescription] = useState(editingExpense?.description || "")
  const [amount, setAmount] = useState<string>(editingExpense?.amount?.toString() || "")
  const [formattedAmount, setFormattedAmount] = useState("")
  const [category, setCategory] = useState(editingExpense?.category || "")
  const [notes, setNotes] = useState(editingExpense?.notes || "")

  useEffect(() => {
    if (editingExpense?.amount) {
      const formatted = editingExpense.amount.toLocaleString("es-CO")
      setFormattedAmount(formatted)
    }
  }, [editingExpense])

  const formatNumber = (value: string) => {
    // Eliminar cualquier caracter que no sea número
    const number = value.replace(/\D/g, "")
    // Convertir a número y formatear con separadores de miles
    return number ? Number(number).toLocaleString("es-CO") : ""
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    setAmount(value)
    
    if (value) {
      const number = parseInt(value, 10)
      const formatted = number.toLocaleString("es-CO")
      setFormattedAmount(formatted)
    } else {
      setFormattedAmount("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !category) return

    const expenseData = {
      description,
      amount: parseFloat(amount.replace(/[^\d]/g, "")),
      date: new Date(date).toISOString(),
      category,
      notes,
    }

    if (editingExpense) {
      updateExpense({
        ...expenseData,
        id: editingExpense.id
      })
    } else {
      addExpense(expenseData)
    }

    // Reset form
    setDescription("")
    setAmount("")
    setFormattedAmount("")
    setDate(new Date().toISOString().split("T")[0])
    setCategory("")
    setNotes("")
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingExpense ? "Editar Gasto" : "Agregar Gasto"}
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del gasto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                {currency.symbol}
              </span>
              <Input
                id="amount"
                type="text"
                value={formattedAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="pl-7 w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alimentacion">Alimentación</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
                <SelectItem value="salud">Salud</SelectItem>
                <SelectItem value="ahorro">Ahorro</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingExpense ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
