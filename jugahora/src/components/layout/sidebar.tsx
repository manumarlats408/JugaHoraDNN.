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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/inventario", icon: FileText, label: "Inventario" },
  { href: "/finanzas", icon: DollarSign, label: "Finanzas" },
  { href: "/partidos", icon: CalendarIcon, label: "Partidos" },
  { href: "/eventos", icon: Trophy, label: "Eventos" },
  { href: "/usuarios", icon: Users, label: "Usuarios" },
  { href: "/configuracion", icon: Settings, label: "Configuración" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavLinks = () => (
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
                "md:w-auto", // Ensure proper width on mobile
              )}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} className={cn("flex-shrink-0", isActive ? "text-gray-900" : "text-gray-600")} />
              {(expanded || mobileMenuOpen) && (
                <span className={cn("text-sm", isActive ? "text-gray-900 font-medium" : "text-gray-600")}>
                  {item.label}
                </span>
              )}
            </Link>

            {/* Simple tooltip - only on desktop */}
            {!expanded && activeTooltip === item.href && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 hidden md:block">
                {item.label}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 bg-white border-r flex flex-col items-center py-4 transition-all duration-300 z-10 hidden md:flex",
        expanded ? "w-48" : "w-16",
      )}
    >
      <div className="mb-8 relative w-full flex justify-center">
        <Link href="/club-dashboard" className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100">
          <LayoutGrid size={20} className="text-gray-600" />
        </Link>

        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute right-2 top-1 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          aria-label={expanded ? "Contraer menú" : "Expandir menú"}
        >
          <ChevronRight size={12} className={cn("text-gray-600 transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      <NavLinks />
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
      {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      <span className="sr-only">Toggle Menu</span>
    </Button>
  )

  // Mobile sidebar
  const MobileSidebar = mobileMenuOpen && (
    <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg py-4 px-2" onClick={(e) => e.stopPropagation()}>
        <div className="mb-8 relative w-full flex justify-center">
          <Link
            href="/club-dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutGrid size={20} className="text-gray-600" />
          </Link>
        </div>

        <NavLinks />
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
