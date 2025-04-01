// components/CollapsibleSection.tsx
'use client'

import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="w-full max-w-lg shadow-lg border-green-100 mb-6">
      <div
        className="bg-green-50 border-b border-green-100 flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-2xl font-bold text-green-800">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-green-800" /> : <ChevronDown className="w-5 h-5 text-green-800" />}
      </div>

      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  )
}
