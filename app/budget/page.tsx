import DashboardLayout from "../dashboard-layout"
import BudgetOverview from "@/components/budget-overview"

export default function BudgetPage() {
  return (
    <DashboardLayout>
      <div className="container w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-2">Presupuestos</h2>
        <BudgetOverview />
      </div>
    </DashboardLayout>
  )
} 