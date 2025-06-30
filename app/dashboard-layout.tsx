"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserNav } from "@/components/user-nav"
import { cn } from "@/lib/utils"
import { Home, List, User, Menu, BarChart2, TrendingDown, TrendingUp, Target, Wallet } from "lucide-react"
import { useState, useEffect } from "react"

const navLinks = [
  { href: "/overview", label: "Resumen", icon: Home },
  { href: "/expenses", label: "Gastos", icon: TrendingDown },
  { href: "/income", label: "Ingresos", icon: TrendingUp },
  { href: "/budget", label: "Presupuestos", icon: Wallet },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/categories", label: "Categorías", icon: List },
  { href: "/profile", label: "Perfil", icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Cierra el sidebar al navegar
  const handleNavClick = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      {/* Sidebar escritorio */}
      <aside className={cn(
        "hidden md:flex w-56 bg-white border-r flex-col py-6 px-4 gap-4 z-20 transition-all duration-500 ease-out",
        isLoaded ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
      )}>
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors duration-200">
            Mis Finanzas
          </Link>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 group relative overflow-hidden",
                pathname === link.href && "bg-primary/10 text-primary font-semibold shadow-sm",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <link.icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <UserNav />
        </div>
      </aside>

      {/* Botón hamburguesa móvil */}
      <button
        className={cn(
          "md:hidden fixed top-4 left-4 z-30 bg-white border rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-200",
          "animate-fade-in-down"
        )}
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
        style={{ animationDelay: '0.1s' }}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex animate-fade-in">
          {/* Fondo oscuro */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          />
          {/* Sidebar drawer */}
          <aside className={cn(
            "relative w-56 bg-white border-r flex flex-col py-6 px-4 gap-4",
            "animate-slide-in-left shadow-2xl"
          )}>
            <div className="mb-8">
              <Link 
                href="/" 
                className="text-xl font-bold tracking-tight hover:text-primary transition-colors duration-200" 
                onClick={handleNavClick}
              >
                Mis Finanzas
              </Link>
            </div>
            <nav className="flex-1 flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 group relative overflow-hidden",
                    pathname === link.href && "bg-primary/10 text-primary font-semibold shadow-sm"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <link.icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <UserNav />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 w-full overflow-x-auto px-2 sm:px-4 md:px-8 py-4 sm:py-8 transition-all duration-500 ease-out",
        isLoaded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      )}>
        {children}
      </main>

      {/* Animaciones CSS */}
      <style jsx global>{`
        @keyframes slide-in-left {
          from { 
            transform: translateX(-100%); 
            opacity: 0;
          }
          to { 
            transform: translateX(0); 
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from { 
            transform: translateY(20px); 
            opacity: 0;
          }
          to { 
            transform: translateY(0); 
            opacity: 1;
          }
        }
        
        @keyframes fade-in-down {
          from { 
            transform: translateY(-20px); 
            opacity: 0;
          }
          to { 
            transform: translateY(0); 
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}