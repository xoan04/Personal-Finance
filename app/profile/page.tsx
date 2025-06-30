"use client"

import { ProfileForm } from "@/components/profile-form"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "../dashboard-layout"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Perfil de usuario</h1>
        <p className="text-muted-foreground mb-6">Aquí puedes ver y editar la información de tu perfil.</p>
        <div className="max-w-2xl mx-auto">
          <ProfileForm />
        </div>
      </div>
    </DashboardLayout>
  )
} 