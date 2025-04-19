"use client"

import type React from "react"
import type { Income } from "@/lib/types"

import { useState } from "react"
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

interface IncomeFormProps {
  onClose: () => void
  editingIncome?: Income
}

const formatNumber = (value: string) => {
  // Eliminar cualquier caracter que no sea número
  const number = value.replace(/\D/g, "")
  // Convertir a número y formatear con separadores de miles
  return number ? Number(number).toLocaleString("es-CO") : ""
}

export default function IncomeForm({ onClose, editingIncome }: IncomeFormProps) {
  const { addIncome, updateIncome, data } = useFinance()
  const { currency } = data
  const [date, setDate] = useState<Date>(editingIncome ? new Date(editingIncome.date) : new Date())
  const [description, setDescription] = useState(editingIncome?.description || "")
  const [amount, setAmount] = useState(editingIncome?.amount.toString() || "")
  const [formattedAmount, setFormattedAmount] = useState(
    editingIncome ? formatNumber(editingIncome.amount.toString()) : ""
  )
  const [category, setCategory] = useState(editingIncome?.category || "")
  const [notes, setNotes] = useState(editingIncome?.notes || "")

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Guardar el valor sin formato para el submit
    const cleanValue = value.replace(/\D/g, "")
    setAmount(cleanValue)
    // Mostrar el valor formateado en el input
    setFormattedAmount(formatNumber(value))
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
      const incomeData = {
        description,
        amount: Number(amount),
        category,
        date: date.toISOString().split("T")[0],
        notes,
      }

      if (editingIncome) {
        await updateIncome({
          ...incomeData,
          id: editingIncome.id,
          createdAt: editingIncome.createdAt,
        })
        toast({
          title: "Ingreso actualizado",
          description: "El ingreso ha sido actualizado correctamente",
        })
      } else {
        await addIncome(incomeData)
        toast({
          title: "Ingreso añadido",
          description: "El ingreso ha sido registrado correctamente",
        })
      }

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al procesar el ingreso",
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
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="text-lg sm:text-xl font-bold mb-4">
          {editingIncome ? "Editar Ingreso" : "Añadir Ingreso"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Input
              id="description"
              placeholder="Ej: Salario"
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
                <SelectItem value="salary">Salario</SelectItem>
                <SelectItem value="freelance">Trabajo freelance</SelectItem>
                <SelectItem value="investment">Inversiones</SelectItem>
                <SelectItem value="gift">Regalo</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
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
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
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
              placeholder="Añade detalles adicionales"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
