"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFinance } from "@/context/finance-context"

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useFinance()
  const [isOpen, setIsOpen] = useState(false)

  // Convertir selectedMonth a Date para el calendario (evitar problemas de zona horaria)
  const selectedDate = useMemo(() => {
    if (!selectedMonth) return new Date()
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1) // month - 1 porque los meses en JS van de 0-11
    return date
  }, [selectedMonth])

  // Función para navegar al mes anterior
  const goToPreviousMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const currentDate = new Date(year, month - 1, 1)
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const monthString = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthString)
  }

  // Función para navegar al mes siguiente
  const goToNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const currentDate = new Date(year, month - 1, 1)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    const monthString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthString)
  }

  // Función para ir al mes actual
  const goToCurrentMonth = () => {
    const now = new Date()
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthString)
  }

  // Función para manejar la selección de fecha en el calendario
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      setSelectedMonth(monthString)
      setIsOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal h-8 px-3",
              !selectedMonth && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedMonth ? format(selectedDate, "MMMM yyyy", { locale: es }) : "Seleccionar mes"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-md border"
            disabled={(date) => {
              // Deshabilitar fechas futuras más allá del mes actual
              const now = new Date()
              const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
              return date > currentMonth
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextMonth}
        className="h-8 w-8"
        disabled={(() => {
          const [year, month] = selectedMonth.split('-').map(Number)
          const currentDate = new Date(year, month - 1, 1)
          const now = new Date()
          const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return currentDate >= currentMonth
        })()}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToCurrentMonth}
        className="h-8 px-2 text-xs"
      >
        Hoy
      </Button>
    </div>
  )
} 