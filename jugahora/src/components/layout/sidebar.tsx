"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutGrid,
  FileText,
  CalendarIcon,
  Users,
  Settings,
  DollarSign,
  ChevronRight,
  Trophy,
  Menu,
  X,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Agregamos Dashboard como primera opción
const navItems = [
  { href: "/club-dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/partidos", icon: CalendarIcon, label: "Partidos" },
  { href: "/abonados", icon: UserCheck, label: "Abonados" },
  { href: "/eventos", icon: Trophy, label: "Eventos" },
  { href: "/inventario", icon: FileText, label: "Inventario" },
  { href: "/finanzas", icon: DollarSign, label: "Finanzas" },
  { href: "/usuarios", icon: Users, label: "Usuarios" },
  { href: "/configuracion", icon: Settings, label: "Configuración" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 bg-white border-r flex flex-col items-center py-4 transition-all duration-300 z-10 hidden md:flex",
        expanded ? "w-48" : "w-16",
      )}
    >
      <div className="mb-8 relative w-full flex justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute right-2 top-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          aria-label={expanded ? "Contraer menú" : "Expandir menú"}
        >
          <ChevronRight size={12} className={cn("text-gray-600 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      <nav className={cn("flex flex-col items-center space-y-4", expanded && "w-full px-3")}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/club-dashboard" && pathname.startsWith(item.href))

          return (
            <div
              key={item.href}
              className="relative w-full"
              onMouseEnter={() => !expanded && setActiveTooltip(item.href)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md hover:bg-gray-100 transition-colors",
                  expanded ? "w-full px-3 py-2 justify-start space-x-3" : "w-10 h-10 justify-center",
                  isActive && "bg-gray-100",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon size={20} className={cn("flex-shrink-0", isActive ? "text-gray-900" : "text-gray-600")} />
                {expanded && (
                  <span className={cn("text-sm", isActive ? "text-gray-900 font-medium" : "text-gray-600")}>
                    {item.label}
                  </span>
                )}
              </Link>

              {/* Simple tooltip */}
              {!expanded && activeTooltip === item.href && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )

  // Mobile menu button
  const MobileMenuButton = (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-sm"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  )

  // Mobile sidebar - simplificado
  const MobileSidebar = mobileMenuOpen && (
    <div className="fixed inset-0 z-40 md:hidden" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 max-w-[80%] bg-white shadow-lg py-6 px-4">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/club-dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 rounded-md hover:bg-gray-100 transition-colors",
                  isActive && "bg-gray-100",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={20} className={cn("mr-3", isActive ? "text-gray-900" : "text-gray-600")} />
                <span className={cn("text-sm", isActive ? "text-gray-900 font-medium" : "text-gray-600")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  return (
    <>
      {DesktopSidebar}
      {MobileMenuButton}
      {MobileSidebar}
    </>
  )
}
