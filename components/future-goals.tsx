"use client"

import type React from "react"

import { useState } from "react"
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

export default function FutureGoals() {
  const { data, addGoal, updateGoal, deleteGoal, addFundsToGoal } = useFinance()
  const { currency } = data
  const [showForm, setShowForm] = useState(false)
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [fundsToAdd, setFundsToAdd] = useState("")

  // Estados para el formulario de metas
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

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
      targetAmount: Number.parseFloat(targetAmount),
      currentAmount: currentAmount ? Number.parseFloat(currentAmount) : 0,
      deadline,
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
    setDeadline("")
    setEditingGoalId(null)
    setShowForm(false)
  }

  const handleEdit = (goal: any) => {
    setTitle(goal.title)
    setDescription(goal.description)
    setTargetAmount(goal.targetAmount.toString())
    setCurrentAmount(goal.currentAmount.toString())
    setDeadline(goal.deadline)
    setEditingGoalId(goal.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta meta?")) {
      deleteGoal(id)
      toast({
        title: "Meta eliminada",
        description: "La meta ha sido eliminada correctamente",
      })
    }
  }

  const handleAddFunds = () => {
    if (!selectedGoalId || !fundsToAdd || Number.parseFloat(fundsToAdd) <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un monto válido",
        variant: "destructive",
      })
      return
    }

    addFundsToGoal(selectedGoalId, Number.parseFloat(fundsToAdd))
    setShowAddFundsDialog(false)
    setFundsToAdd("")
    setSelectedGoalId(null)

    toast({
      title: "Fondos añadidos",
      description: "Los fondos han sido añadidos correctamente a tu meta",
    })
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
                      type="number"
                      className="pl-7 w-full"
                      placeholder="0.00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      step="0.01"
                      min="0"
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
                      type="number"
                      className="pl-7 w-full"
                      placeholder="0.00"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">Fecha límite</Label>
                <Input
                  id="deadline"
                  placeholder="Ej: Diciembre 2025"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full"
                />
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
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                    value={(goal.currentAmount / goal.targetAmount) * 100} 
                    className="h-2"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Fecha límite: {goal.deadline}
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
                  type="number"
                  className="pl-7 w-full"
                  placeholder="0.00"
                  value={fundsToAdd}
                  onChange={(e) => setFundsToAdd(e.target.value)}
                  step="0.01"
                  min="0"
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
