"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import { useFinance } from "@/context/finance-context"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2, HelpCircle } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import type { BudgetRule } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface Category {
  name: string;
  percentage: number;
  color: string;
}

interface CategoryValue extends Category {
  target: number;
  current: number;
  percent: number;
}

const categoryDescriptions: Record<string, string> = {
  "Necesidades": "Este porcentaje se destina a gastos esenciales como vivienda, comida, transporte, servicios públicos, y otros gastos necesarios para la supervivencia.",
  "Deseos": "Este porcentaje se destina a gastos no esenciales, como entretenimiento, comidas fuera de casa, vacaciones, y otros gastos que mejoran la calidad de vida, pero que no son imprescindibles.",
  "Ahorros": "Este porcentaje se destina a ahorrar para el futuro, ya sea para metas a largo plazo, como comprar una casa o jubilarse, o para crear un fondo de emergencia."
}

export default function BudgetOverview() {
  const { totalIncome, totalExpenses, data, addBudgetRule, updateBudgetRule, deleteBudgetRule, setActiveBudgetRule } = useFinance()
  const { currency, budgetRules = [], activeBudgetRuleId } = data || {}
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<BudgetRule | null>(null)

  // Regla por defecto
  const defaultRule: BudgetRule = {
    id: "50-30-20",
    name: "Regla 50/30/20",
    description: "La regla 50/30/20 es un método simple para presupuestar y ahorrar dinero, que divide los ingresos en tres categorías: 50% para necesidades básicas, 30% para deseos y 20% para ahorros.",
    categories: [
      { 
        name: "Necesidades", 
        percentage: 50, 
        color: "#0ea5e9",
        description: "50% de tus ingresos para necesidades básicas como vivienda, alimentación, servicios públicos, transporte y gastos médicos esenciales."
      },
      { 
        name: "Deseos", 
        percentage: 30, 
        color: "#8b5cf6",
        description: "30% para gastos no esenciales como entretenimiento, compras discrecionales, salidas a comer y hobbies."
      },
      { 
        name: "Ahorros", 
        percentage: 20, 
        color: "#10b981",
        description: "20% destinado a ahorros, inversiones, fondo de emergencia y metas financieras a largo plazo."
      }
    ],
    isDefault: true
  }

  // Asegurarnos de que siempre haya una regla activa
  const activeRule = budgetRules.find((rule: BudgetRule) => rule.id === activeBudgetRuleId) || 
                    budgetRules[0] || 
                    defaultRule

  // Asegurarnos de que budgetRules siempre tenga al menos la regla por defecto
  const rules = budgetRules.length > 0 ? budgetRules : [defaultRule]

  // Calcular valores para cada categoría de la regla activa
  const categoryValues = activeRule.categories.map((category: Category) => {
    const target = totalIncome * (category.percentage / 100)
    let current = 0;

    // Calcular el total actual según las categorías de gastos
    data.expenses.forEach((expense) => {
      if (category.name === "Necesidades" && 
          ["alimentacion", "transporte", "servicios", "salud"].includes(expense.category)) {
        current += expense.amount;
      } else if (category.name === "Deseos" && 
                ["entretenimiento", "otros"].includes(expense.category)) {
        current += expense.amount;
      } else if (category.name === "Ahorros" && 
                expense.category === "ahorro") {
        current += expense.amount;
      }
    });

    const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;

    return {
      ...category,
      target,
      current,
      percent
    }
  })

  // Datos para el gráfico de pastel
  const pieData = categoryValues
    .map((category: CategoryValue) => ({
      name: category.name,
      value: category.current,
      color: category.color
    }))
    .filter((item: { value: number }) => item.value > 0)

  const handleSubmitRule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const categories = activeRule.categories.map((cat: Category, index: number) => ({
      name: formData.get(`category-${index}-name`) as string,
      percentage: Number(formData.get(`category-${index}-percentage`)),
      color: formData.get(`category-${index}-color`) as string
    }))

    const totalPercentage = categories.reduce((sum: number, cat: Category) => sum + cat.percentage, 0)
    if (totalPercentage !== 100) {
      toast({
        title: "Error",
        description: "Los porcentajes deben sumar 100%",
        variant: "destructive"
      })
      return
    }

    const ruleData = {
      name,
      description,
      categories
    }

    if (editingRule) {
      updateBudgetRule({
        ...ruleData,
        id: editingRule.id,
        isDefault: editingRule.isDefault
      })
      toast({
        title: "Regla actualizada",
        description: "La regla ha sido actualizada correctamente"
      })
    } else {
      addBudgetRule(ruleData)
      toast({
        title: "Regla creada",
        description: "La nueva regla ha sido creada correctamente"
      })
    }

    setShowRuleForm(false)
    setEditingRule(null)
  }

  const handleDeleteRule = (rule: BudgetRule) => {
    if (rule.isDefault) {
      toast({
        title: "Error",
        description: "No se puede eliminar la regla predeterminada",
        variant: "destructive"
      })
      return
    }

    deleteBudgetRule(rule.id)
    toast({
      title: "Regla eliminada",
      description: "La regla ha sido eliminada correctamente"
    })
  }

  if (totalIncome === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Añade ingresos y gastos para ver tu distribución según las reglas de presupuesto
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-xl md:text-2xl">Reglas de Presupuesto</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Selecciona o crea tus propias reglas de distribución
            </CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingRule(null)
              setShowRuleForm(true)
            }}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Regla
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`p-3 md:p-4 rounded-lg border ${
                  rule.id === activeBudgetRuleId ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 space-y-2 sm:space-y-0">
                  <div className="w-full sm:w-auto">
                    <h4 className="font-medium text-base md:text-lg">{rule.name}</h4>
                    {rule.description && (
                      <p className="text-xs md:text-sm text-muted-foreground">{rule.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {!rule.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRule(rule)
                            setShowRuleForm(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteConfirmationDialog
                          title="Eliminar Regla"
                          description={`¿Estás seguro de que deseas eliminar la regla "${rule.name}"? Esta acción no se puede deshacer.`}
                          onDelete={() => handleDeleteRule(rule)}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </>
                    )}
                    {rule.id !== activeBudgetRuleId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveBudgetRule(rule.id)}
                        className="w-full sm:w-auto"
                      >
                        Activar
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {rule.categories.map(category => (
                    <div
                      key={category.name}
                      className="text-center p-2 rounded relative flex flex-row sm:flex-col items-center justify-between sm:justify-center space-x-2 sm:space-x-0"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div className="flex items-center gap-1">
                        <div className="text-sm font-medium">{category.name}</div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-[200px] text-xs sm:text-sm">
                                {categoryDescriptions[category.name] || "Categoría personalizada"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-base sm:text-lg font-bold">{category.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Distribución Actual</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Basado en la regla {activeRule.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="aspect-square w-full max-w-[300px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {categoryValues.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{category.name}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                              <HelpCircle className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[200px] text-xs sm:text-sm">
                              {categoryDescriptions[category.name] || "Categoría personalizada"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-sm text-muted-foreground w-full sm:w-auto text-right">
                      {formatCurrency(category.current, currency)} / {formatCurrency(category.target, currency)}
                    </div>
                  </div>
                  <Progress value={category.percent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {category.percent >= 100
                      ? "Has superado el límite para esta categoría"
                      : `Te falta ${formatCurrency(category.target - category.current, currency)} para alcanzar el objetivo`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRuleForm} onOpenChange={setShowRuleForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingRule ? "Editar Regla" : "Nueva Regla"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitRule} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingRule?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingRule?.description}
                />
              </div>
              <div className="space-y-4">
                <Label>Categorías</Label>
                {activeRule.categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor={`category-${index}-name`}>Nombre</Label>
                      <Input
                        id={`category-${index}-name`}
                        name={`category-${index}-name`}
                        defaultValue={editingRule?.categories[index]?.name ?? category.name}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`category-${index}-percentage`}>Porcentaje</Label>
                      <Input
                        id={`category-${index}-percentage`}
                        name={`category-${index}-percentage`}
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={editingRule?.categories[index]?.percentage ?? category.percentage}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`category-${index}-color`}>Color</Label>
                      <Input
                        id={`category-${index}-color`}
                        name={`category-${index}-color`}
                        type="color"
                        defaultValue={editingRule?.categories[index]?.color ?? category.color}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRuleForm(false)
                  setEditingRule(null)
                }}
                className="w-full sm:w-auto order-1 sm:order-none"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingRule ? "Guardar Cambios" : "Crear Regla"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
