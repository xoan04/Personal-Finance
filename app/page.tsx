"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // Si el usuario está autenticado, redirigir a overview
        router.push('/overview')
      } else {
        // Si no está autenticado, redirigir a login
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  // Mostrar loading mientras se determina la redirección
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  // Este componente no debería renderizarse, pero por si acaso
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Redirigiendo...</span>
        </div>
      </div>
    </ProtectedRoute>
  )
}
