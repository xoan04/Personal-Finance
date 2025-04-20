"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FutureGoals() {
  const { data, addGoal, updateGoal, deleteGoal, addFundsToGoal } = useFinance()
  const { currency } = data
  const [showForm, setShowForm] = useState(false)
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [fundsToAdd, setFundsToAdd] = useState("")
  const [formattedFundsToAdd, setFormattedFundsToAdd] = useState("")
  const [progressValues, setProgressValues] = useState<Record<string, number>>({})

  // Estados para el formulario de metas
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [formattedTargetAmount, setFormattedTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [formattedCurrentAmount, setFormattedCurrentAmount] = useState("")
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  // Efecto para actualizar los valores de progreso cuando cambian las metas
  useEffect(() => {
    const newProgressValues = data.goals.reduce((acc, goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100
      acc[goal.id] = Math.min(progress, 100) // Asegurar que no exceda el 100%
      return acc
    }, {} as Record<string, number>)
    setProgressValues(newProgressValues)
  }, [data.goals])

  const formatNumber = (value: string) => {
    // Eliminar cualquier caracter que no sea número
    const number = value.replace(/\D/g, "")
    // Convertir a número y formatear con separadores de miles
    return number ? Number(number).toLocaleString("es-CO") : ""
  }

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Guardar el valor sin formato para el submit
    const cleanValue = value.replace(/\D/g, "")
    setTargetAmount(cleanValue)
    // Mostrar el valor formateado en el input
    setFormattedTargetAmount(formatNumber(value))
  }

  const handleCurrentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Guardar el valor sin formato para el submit
    const cleanValue = value.replace(/\D/g, "")
    setCurrentAmount(cleanValue)
    // Mostrar el valor formateado en el input
    setFormattedCurrentAmount(formatNumber(value))
  }

  const handleFundsToAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Guardar el valor sin formato para el submit
    const cleanValue = value.replace(/\D/g, "")
    setFundsToAdd(cleanValue)
    // Mostrar el valor formateado en el input
    setFormattedFundsToAdd(formatNumber(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !targetAmount || !deadline) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const goalData = {
      title,
      description,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      deadline: deadline.toISOString(),
    }

    if (editingGoalId) {
      updateGoal({
        ...goalData,
        id: editingGoalId,
      })
      toast({
        title: "Meta actualizada",
        description: "La meta ha sido actualizada correctamente",
      })
    } else {
      addGoal(goalData)
      toast({
        title: "Meta creada",
        description: "La meta ha sido creada correctamente",
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTargetAmount("")
    setCurrentAmount("")
    setDeadline(undefined)
    setEditingGoalId(null)
    setShowForm(false)
  }

  const handleEdit = (goal: any) => {
    setTitle(goal.title)
    setDescription(goal.description)
    setTargetAmount(goal.targetAmount.toString())
    setCurrentAmount(goal.currentAmount.toString())
    setDeadline(new Date(goal.deadline))
    setEditingGoalId(goal.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    deleteGoal(id)
    toast({
      title: "Meta eliminada",
      description: "La meta ha sido eliminada correctamente",
    })
  }

  const handleAddFunds = async () => {
    if (!selectedGoalId || !fundsToAdd || Number(fundsToAdd) <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un monto válido",
        variant: "destructive",
      })
      return
    }

    try {
      await addFundsToGoal(selectedGoalId, Number(fundsToAdd))
      
      // Actualizar el progreso inmediatamente
      const goal = data.goals.find(g => g.id === selectedGoalId)
      if (goal) {
        const newAmount = goal.currentAmount + Number(fundsToAdd)
        const newProgress = Math.min((newAmount / goal.targetAmount) * 100, 100)
        setProgressValues(prev => ({
          ...prev,
          [selectedGoalId]: newProgress
        }))
      }

      setShowAddFundsDialog(false)
      setFundsToAdd("")
      setFormattedFundsToAdd("")
      setSelectedGoalId(null)

      toast({
        title: "Fondos añadidos",
        description: "Los fondos han sido añadidos correctamente a tu meta",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al añadir los fondos",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold">Mis Metas Financieras</h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nueva Meta
        </Button>
      </div>

      {showForm && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {editingGoalId ? "Editar Meta" : "Crear Nueva Meta"}
            </CardTitle>
            <CardDescription className="text-sm">
              Define una nueva meta financiera para tu futuro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Comprar una casa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu meta"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount" className="text-sm font-medium">Monto objetivo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">{currency.symbol}</span>
                    <Input
                      id="targetAmount"
                      type="text"
                      inputMode="numeric"
                      className="pl-7 w-full"
                      placeholder="0"
                      value={formattedTargetAmount}
                      onChange={handleTargetAmountChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAmount" className="text-sm font-medium">Monto actual</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">{currency.symbol}</span>
                    <Input
                      id="currentAmount"
                      type="text"
                      inputMode="numeric"
                      className="pl-7 w-full"
                      placeholder="0"
                      value={formattedCurrentAmount}
                      onChange={handleCurrentAmountChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">Fecha límite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={"outline"} 
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "MMMM yyyy", { locale: es }).replace(/^\w/, c => c.toUpperCase()) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={deadline} 
                      onSelect={setDeadline}
                      initialFocus 
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {data.goals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm sm:text-base text-muted-foreground">
            No tienes metas financieras. ¡Crea una ahora!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {data.goals.map((goal) => (
            <Card key={goal.id} className="w-full">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <CardTitle className="text-lg sm:text-xl">{goal.title}</CardTitle>
                  <div className="flex gap-1 w-full sm:w-auto justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteConfirmationDialog
                      title="Eliminar Meta"
                      description={`¿Estás seguro de que deseas eliminar la meta "${goal.title}"? Esta acción no se puede deshacer.`}
                      onDelete={() => handleDelete(goal.id)}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
                <CardDescription className="text-sm">{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                    <span className="text-sm font-medium">Progreso:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                  <Progress 
                    value={progressValues[goal.id]} 
                    className="h-2 transition-all duration-700 ease-in-out bg-secondary"
                    style={{
                      background: 'hsl(var(--secondary))',
                    }}
                  >
                    <div
                      className="h-full bg-primary transition-all duration-700 ease-in-out"
                      style={{
                        width: `${progressValues[goal.id]}%`,
                        background: 'hsl(var(--primary))',
                      }}
                    />
                  </Progress>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Fecha límite: {new Date(goal.deadline).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setSelectedGoalId(goal.id)
                        setShowAddFundsDialog(true)
                      }}
                    >
                      Añadir Fondos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Añadir Fondos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="funds" className="text-sm font-medium">Monto a añadir</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                  {currency.symbol}
                </span>
                <Input
                  id="funds"
                  type="text"
                  inputMode="numeric"
                  className="pl-7 w-full"
                  placeholder="0"
                  value={formattedFundsToAdd}
                  onChange={handleFundsToAddChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddFundsDialog(false)
                setFundsToAdd("")
                setSelectedGoalId(null)
              }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddFunds}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
