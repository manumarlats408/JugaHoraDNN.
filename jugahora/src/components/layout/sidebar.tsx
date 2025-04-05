import Link from "next/link"
import { LayoutGrid, FileText, CalendarIcon, Users, Settings, DollarSign, Trophy } from "lucide-react"

export function Sidebar() {
  return (
    <div className="h-screen w-16 fixed left-0 top-0 bg-white border-r flex flex-col items-center py-4">
      <div className="mb-8">
        <Link href="/club-dashboard" className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100">
          <LayoutGrid size={20} className="text-gray-600" />
        </Link>
      </div>

      <nav className="flex flex-col items-center space-y-4">
        <Link href="/inventario" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <FileText size={20} className="text-gray-600" />
        </Link>

        <Link href="/finanzas" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <DollarSign size={20} className="text-green-600" />
        </Link>

        <Link href="/partidos" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <CalendarIcon size={20} className="text-gray-600" />
        </Link>

        <Link href="/eventos" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <Trophy size={20} className="text-gray-600" />
        </Link>

        <Link href="/usuarios" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <Users size={20} className="text-gray-600" />
        </Link>

        <Link href="/configuracion" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <Settings size={20} className="text-gray-600" />
        </Link>
      </nav>
    </div>
  )
}

