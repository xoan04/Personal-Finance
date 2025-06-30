import DashboardLayout from "../dashboard-layout"
import FutureGoals from "@/components/future-goals"

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <div className="container w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-2">Metas</h2>
        <FutureGoals />
      </div>
    </DashboardLayout>
  )
} 