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

// Función para formatear fechas de forma segura
const formatDate = (date: Date) => {
  if (!date || isNaN(date.getTime())) {
    return "Selecciona una fecha"
  }
  return format(date, "PPP", { locale: es })
}
import { useFinance } from "@/context/finance-context"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import type { Expense } from "@/lib/types"

export interface ExpenseFormProps {
  onClose?: () => void
  editingExpense?: Expense
}

export function ExpenseForm({ onClose, editingExpense }: ExpenseFormProps) {
  const { addExpense, updateExpense, data, categories } = useFinance()
  const { currency } = data
  const [date, setDate] = useState<Date>(() => {
    if (editingExpense?.date) {
      // Asegurar que la fecha sea un Date object válido
      const dateObj = editingExpense.date instanceof Date ? editingExpense.date : new Date(editingExpense.date)
      return isNaN(dateObj.getTime()) ? new Date() : dateObj
    }
    return new Date()
  })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount || !category || !date) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      const expenseData = {
        description,
        amount: parseFloat(amount.replace(/[^\d]/g, "")),
        date: date,
        category,
        notes,
      }

      if (editingExpense) {
        await updateExpense({
          ...expenseData,
          id: editingExpense.id
        })
        toast({
          title: "Gasto actualizado",
          description: "El gasto ha sido actualizado correctamente",
        })
      } else {
        await addExpense(expenseData)
        toast({
          title: "Gasto añadido",
          description: "El gasto ha sido registrado correctamente",
        })
      }

      onClose?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al procesar el gasto",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-md p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 sm:right-4 top-2 sm:top-4" 
          onClick={() => onClose?.()}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="text-lg sm:text-xl font-bold mb-4">
          {editingExpense ? "Editar Gasto" : "Agregar Gasto"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Input
              id="description"
              placeholder="Descripción del gasto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Monto
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                {currency.symbol}
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                className="pl-7 w-full"
                placeholder="0"
                value={formattedAmount}
                onChange={handleAmountChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {categories.filter(cat => cat.active).map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={"outline"} 
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={(date) => date && setDate(date)} 
                  initialFocus 
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px]"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose?.()}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto"
            >
              {editingExpense ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
