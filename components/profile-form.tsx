"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Eye, EyeOff, Pencil } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { 
  updateProfile, 
  updateEmail, 
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ProfileForm() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [originalEmail, setOriginalEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [showVerificationSent, setShowVerificationSent] = useState(false)
  const [showReauthentication, setShowReauthentication] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  
  // Estados para controlar la edición de cada sección
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setName(userData.name || "")
            setLastName(userData.lastName || "")
            setEmail(user.email || "")
            setOriginalEmail(user.email || "")
          } else {
            const displayName = user.displayName || ""
            const [firstName, ...lastNameParts] = displayName.split(" ")
            setName(firstName || "")
            setLastName(lastNameParts.join(" ") || "")
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error)
          setError("Error al cargar los datos del usuario")
        } finally {
          setIsLoadingData(false)
        }
      }
    }

    loadUserData()
  }, [user])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Si el correo ha cambiado, mostrar el modal de confirmación
    if (email !== originalEmail) {
      setPendingEmail(email)
      setShowEmailConfirmation(true)
      return
    }

    await updateUserData()
  }

  const handleReauthentication = async () => {
    if (!user || !password) return

    setIsLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)
      setShowReauthentication(false)
      setPassword("")
      
      // Enviar correo de verificación al nuevo email
      await verifyBeforeUpdateEmail(user, email)
      setSuccess("Se ha enviado un correo de verificación a tu nueva dirección de correo electrónico")
      
      // Forzar cierre de sesión
      setTimeout(async () => {
        await logout()
        router.push("/login")
      }, 2000)
      
    } catch (error: any) {
      console.error("Error de reautenticación:", error)
      if (error.code === "auth/wrong-password") {
        setError("La contraseña es incorrecta")
      } else if (error.code === "auth/too-many-requests") {
        setError("Demasiados intentos fallidos. Por favor, intenta más tarde")
      } else {
        setError("Error al reautenticar. Por favor, intenta nuevamente")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const initiateEmailChange = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      await verifyBeforeUpdateEmail(user, email)
      setShowEmailConfirmation(false)
      setShowVerificationSent(true)
      setSuccess("Se ha enviado un correo de verificación a tu nueva dirección de correo electrónico")
      
      // Forzar cierre de sesión
      setTimeout(async () => {
        await logout()
        router.push("/login")
      }, 2000)
      
    } catch (error: any) {
      console.error("Error al iniciar cambio de correo:", error)
      if (error.code === "auth/requires-recent-login") {
        setError("")
        setShowEmailConfirmation(false)
        setShowReauthentication(true)
      } else if (error.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está en uso")
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido")
      } else {
        setError("Error al iniciar el cambio de correo electrónico")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserData = async () => {
    if (!user) return

    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!name.trim() || !lastName.trim()) {
      setError("El nombre y apellido son requeridos")
      setIsLoading(false)
      return
    }

    try {
      // Actualizar displayName en Auth y datos en Firestore
      await Promise.all([
        updateProfile(user, {
          displayName: `${name} ${lastName}`
        }),
        setDoc(doc(db, "users", user.uid), {
          name,
          lastName,
          email: user.email, // Mantener el email actual ya que el cambio se maneja por separado
          updatedAt: new Date()
        }, { merge: true })
      ])

      setSuccess("Perfil actualizado correctamente")
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error)
      setError("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!user || !password || !newPassword || !confirmPassword) return
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    try {
      // Primero reautenticar
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)
      
      // Luego actualizar contraseña
      await updatePassword(user, newPassword)
      
      setSuccess("Contraseña actualizada correctamente")
      setShowPasswordChange(false)
      setPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setEditingPassword(false)
      
      // Cerrar sesión después de cambiar la contraseña
      setTimeout(async () => {
        await logout()
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error)
      if (error.code === "auth/wrong-password") {
        setError("La contraseña actual es incorrecta")
      } else {
        setError("Error al cambiar la contraseña")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setSuccess("")
    setIsLoading(true)

    if (!name.trim() || !lastName.trim()) {
      setError("El nombre y apellido son requeridos")
      setIsLoading(false)
      return
    }

    try {
      await Promise.all([
        updateProfile(user, {
          displayName: `${name} ${lastName}`
        }),
        setDoc(doc(db, "users", user.uid), {
          name,
          lastName,
          updatedAt: new Date()
        }, { merge: true })
      ])

      setSuccess("Nombre actualizado correctamente")
      setEditingName(false)
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      setError("Error al actualizar el nombre")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>
                Actualiza tu información personal
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

          {/* Sección de Nombre */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Información Personal</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingName(!editingName)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {editingName ? "Cancelar" : "Editar"}
              </Button>
            </div>
            <form onSubmit={handleNameSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editingName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!editingName}
                  required
                />
              </div>
              {editingName && (
                <div className="col-span-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Sección de Correo */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Correo Electrónico</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingEmail(!editingEmail)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {editingEmail ? "Cancelar" : "Editar"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editingEmail}
                required
              />
              {editingEmail && (
                <Button 
                  className="w-full mt-2" 
                  onClick={() => {
                    setPendingEmail(email)
                    setShowEmailConfirmation(true)
                  }}
                  disabled={email === originalEmail}
                >
                  Cambiar correo
                </Button>
              )}
            </div>
          </div>

          {/* Sección de Contraseña */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Contraseña</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPassword(!editingPassword)
                  if (!editingPassword) {
                    setShowPasswordChange(true)
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {editingPassword ? "Cancelar" : "Cambiar"}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Tu contraseña debe tener al menos 8 caracteres
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de cambio de contraseña */}
      <AlertDialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar Contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPasswordChange(false)
              setPassword("")
              setNewPassword("")
              setConfirmPassword("")
              setEditingPassword(false)
              setError("")
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePasswordChange}
              disabled={!password || !newPassword || !confirmPassword || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEmailConfirmation} onOpenChange={setShowEmailConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar correo electrónico?</AlertDialogTitle>
            <AlertDialogDescription>
              Para cambiar tu correo electrónico, enviaremos un enlace de verificación a tu nueva dirección de correo.
              Deberás hacer clic en el enlace para confirmar el cambio.
              Una vez verificado, se cerrará tu sesión actual y necesitarás iniciar sesión nuevamente con tu nuevo correo electrónico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setEmail(originalEmail)
              setShowEmailConfirmation(false)
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={initiateEmailChange}>
              Enviar verificación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showVerificationSent} onOpenChange={setShowVerificationSent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verificación enviada</AlertDialogTitle>
            <AlertDialogDescription>
              Se ha enviado un correo de verificación a {email}. 
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones para completar el cambio de correo electrónico.
              Una vez verificado, se cerrará tu sesión y podrás iniciar sesión con tu nuevo correo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowVerificationSent(false)
              router.push("/")
            }}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReauthentication} onOpenChange={setShowReauthentication}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verificación de seguridad</AlertDialogTitle>
            <AlertDialogDescription>
              Por seguridad, necesitamos verificar tu identidad antes de cambiar el correo electrónico.
              Por favor, ingresa tu contraseña actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowReauthentication(false)
              setPassword("")
              setError("")
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReauthentication} disabled={!password || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 