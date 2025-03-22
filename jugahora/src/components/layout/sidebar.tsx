import Link from "next/link"
import { LayoutGrid, FileText, BarChart2, Users, Settings, DollarSign } from "lucide-react"

export function Sidebar() {
  return (
    <div className="h-screen w-16 fixed left-0 top-0 bg-white border-r flex flex-col items-center py-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100">
          <LayoutGrid size={20} className="text-gray-600" />
        </Link>
      </div>

      <nav className="flex flex-col items-center space-y-4">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <FileText size={20} className="text-gray-600" />
        </Link>

        <Link href="/movimientos" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <DollarSign size={20} className="text-green-600" />
        </Link>

        <Link href="/estadisticas" className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100">
          <BarChart2 size={20} className="text-gray-600" />
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

