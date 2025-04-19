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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mis Metas Financieras</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nueva Meta
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingGoalId ? "Editar Meta" : "Crear Nueva Meta"}</CardTitle>
            <CardDescription>Define una nueva meta financiera para tu futuro</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Comprar una casa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu meta"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Monto objetivo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">{currency.symbol}</span>
                    <Input
                      id="targetAmount"
                      type="number"
                      className="pl-7"
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
                  <Label htmlFor="currentAmount">Monto actual</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">{currency.symbol}</span>
                    <Input
                      id="currentAmount"
                      type="number"
                      className="pl-7"
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
                <Label htmlFor="deadline">Fecha límite</Label>
                <Input
                  id="deadline"
                  placeholder="Ej: Diciembre 2025"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {data.goals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No tienes metas financieras. ¡Crea una ahora!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{goal.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Progreso:</span>
                    <span>
                      {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% completado</span>
                    <span>Fecha límite: {goal.deadline}</span>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedGoalId(goal.id)
                        setShowAddFundsDialog(true)
                      }}
                    >
                      Añadir fondos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir fondos a tu meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="funds">Monto a añadir</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">{currency.symbol}</span>
                <Input
                  id="funds"
                  type="number"
                  className="pl-7"
                  placeholder="0.00"
                  value={fundsToAdd}
                  onChange={(e) => setFundsToAdd(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFundsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddFunds}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
