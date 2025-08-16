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
    if (!selectedMonth || selectedMonth === "all") return new Date()
    const [year, month] = selectedMonth.split('-').map(Number)
    // Crear la fecha en zona horaria local para evitar problemas de UTC
    const date = new Date(year, month - 1, 1, 12, 0, 0, 0) // Usar mediodía para evitar problemas de zona horaria
    return date
  }, [selectedMonth])

  // Función para navegar al mes anterior
  const goToPreviousMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const currentDate = new Date(year, month - 1, 1, 12, 0, 0, 0)
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 12, 0, 0, 0)
    const monthString = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthString)
  }

  // Función para navegar al mes siguiente
  const goToNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const currentDate = new Date(year, month - 1, 1, 12, 0, 0, 0)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 12, 0, 0, 0)
    const monthString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthString)
  }

  // Función para ir al mes actual
  const goToCurrentMonth = () => {
    const now = new Date()
    // Usar la fecha actual en zona horaria local
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(monthString)
  }

  // Función para mostrar todos los meses (datos generales)
  const showAllMonths = () => {
    setSelectedMonth("all")
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
                         {selectedMonth === "all" ? "Todos los meses" : selectedMonth ? format(selectedDate, "MMMM yyyy", { locale: es }) : "Seleccionar mes"}
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
              // Permitir seleccionar cualquier mes (pasado, presente y futuro)
              // Solo deshabilitar fechas muy lejanas en el pasado (más de 10 años)
              const now = new Date()
              const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), 1, 12, 0, 0, 0)
              return date < tenYearsAgo
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
          // Permitir navegar a cualquier mes (pasado, presente y futuro)
          // Solo deshabilitar si es muy lejano en el pasado (más de 10 años)
          const [year, month] = selectedMonth.split('-').map(Number)
          const currentDate = new Date(year, month - 1, 1, 12, 0, 0, 0)
          const now = new Date()
          const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), 1, 12, 0, 0, 0)
          return currentDate <= tenYearsAgo
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

       <Button
         variant="ghost"
         size="sm"
         onClick={showAllMonths}
         className={cn("h-8 px-2 text-xs", selectedMonth === "all" && "bg-primary text-primary-foreground")}
       >
         Todos
       </Button>
    </div>
  )
} 