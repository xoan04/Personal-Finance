import DashboardLayout from "../dashboard-layout"
import CategoryAdmin from "@/components/category-admin"

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Administrar Categorías</h1>
        <p className="text-muted-foreground mb-6">Crea, edita, deshabilita o reactiva tus categorías personalizadas para tus gastos e ingresos.</p>
        <CategoryAdmin />
      </div>
    </DashboardLayout>
  )
} 