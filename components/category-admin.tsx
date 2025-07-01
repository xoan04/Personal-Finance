"use client"
import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Función para convertir clases de Tailwind a colores hexadecimales
const getColorFromTailwindClass = (tailwindClass: string): string => {
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
    'bg-yellow-500': '#f59e0b',
    'bg-purple-500': '#8b5cf6',
    'bg-red-500': '#ef4444',
    'bg-teal-500': '#14b8a6',
    'bg-gray-500': '#6b7280',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-orange-500': '#f97316',
    'bg-cyan-500': '#06b6d4',
    'bg-emerald-500': '#10b981',
    'bg-lime-500': '#84cc16',
    'bg-amber-500': '#f59e0b',
    'bg-rose-500': '#f43f5e',
    'bg-slate-500': '#64748b',
    'bg-zinc-500': '#71717a',
    'bg-neutral-500': '#737373',
    'bg-stone-500': '#78716c',
  }
  
  return colorMap[tailwindClass] || tailwindClass
}

export default function CategoryAdmin() {
  const { categories, addCategory, updateCategory, disableCategory, enableCategory } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", color: "", icon: "" })

  const handleEdit = (cat: any) => {
    setEditing(cat.id)
    setForm({ name: cat.name, color: cat.color, icon: cat.icon || "" })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      updateCategory(editing, form)
    } else {
      addCategory(form)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ name: "", color: "", icon: "" })
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Administrar Categorías</h2>
      <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", color: "", icon: "" }) }} className="mb-4">Nueva Categoría</Button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-50 p-4 rounded">
          <Input
            placeholder="Nombre"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 items-center">
          <Input
            placeholder="Color (ej: bg-pink-500)"
            value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            required
          />
              {form.color && (
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ 
                    backgroundColor: form.color.startsWith('bg-') ? 
                      getColorFromTailwindClass(form.color) : 
                      form.color 
                  }}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-teal-500', 'bg-pink-500', 'bg-orange-500'].map(color => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: getColorFromTailwindClass(color) }}
                  onClick={() => setForm(f => ({ ...f, color }))}
                />
              ))}
            </div>
          </div>
          <Input
            placeholder="Icono (opcional, emoji o nombre)"
            value={form.icon}
            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button type="submit">{editing ? "Guardar cambios" : "Crear"}</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-2 p-2 border rounded bg-white">
            <div 
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              style={{ 
                backgroundColor: cat.color.startsWith('bg-') ? 
                  getColorFromTailwindClass(cat.color) : 
                  cat.color,
                color: 'white',
                borderColor: 'transparent'
              }}
            >
              {cat.icon ? cat.icon + " " : ""}{cat.name}
            </div>
            {!cat.active && <span className="text-xs text-gray-400">(Deshabilitada)</span>}
            <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>Editar</Button>
            {cat.active ? (
              <Button size="sm" variant="destructive" onClick={() => disableCategory(cat.id)}>Deshabilitar</Button>
            ) : (
              <Button size="sm" onClick={() => enableCategory(cat.id)}>Reactivar</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 