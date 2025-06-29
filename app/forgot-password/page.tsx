"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess("Se ha enviado un correo de recuperación a tu dirección de correo electrónico")
      setEmail("")
    } catch (error: any) {
      console.error("Error al enviar correo de recuperación:", error)
      if (error.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico")
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido")
      } else if (error.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Por favor, espera un momento antes de intentar nuevamente")
      } else {
        setError("Error al enviar el correo de recuperación. Por favor, intenta nuevamente")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="flex-1 text-center">
                <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
                <CardDescription>
                  Ingresa tu correo electrónico para recibir un enlace de recuperación
                </CardDescription>
              </div>
              <div className="w-[72px]" />
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar correo de recuperación"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ¿Recordaste tu contraseña?{" "}
                <Link 
                  href="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>

            {success && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ¿Qué hacer ahora?
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. Revisa tu bandeja de entrada</li>
                  <li>2. Busca el correo de "Recuperación de contraseña"</li>
                  <li>3. Haz clic en el enlace del correo</li>
                  <li>4. Crea una nueva contraseña</li>
                </ol>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Si no encuentras el correo, revisa tu carpeta de spam.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 