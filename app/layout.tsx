import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FinanceProvider } from "@/context/finance-context"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mi Presupuesto Personal",
  description: "Aplicación para gestionar finanzas personales",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <FinanceProvider>
            {children}
            <Toaster />
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
