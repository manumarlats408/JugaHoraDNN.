// app/eventos/unirse/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, Clock, DollarSign, MapPin, Trophy, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'

type Evento = {
  id: number
  nombre: string
  date: string
  startTime: string
  endTime: string
  tipo: string
  formato?: string
  categoria?: string
  genero: string
  maxParejas: number
  parejas: string[]
  price: number
  Club: { name: string; address?: string }
}

export default function UnirseEvento() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([])
  const [search, setSearch] = useState('')
  const [fecha, setFecha] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
  const [nombre1, setNombre1] = useState('')
  const [nombre2, setNombre2] = useState('')

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch('/api/eventos/usuarios', { credentials: 'include' })
        const data = await res.json()
        setEventos(data)
        setFilteredEventos(data)
        } catch (err) {
        console.error('Error al cargar eventos:', err)
        toast.error('Error al cargar eventos')
      }
      
    }

    fetchEventos()
  }, [])

  useEffect(() => {
    const filtered = eventos.filter(evento => {
      const matchesSearch = evento.Club.name.toLowerCase().includes(search.toLowerCase())
      const matchesFecha =
        !fecha || new Date(evento.date).toISOString().split('T')[0] === fecha
      return matchesSearch && matchesFecha
    })

    setFilteredEventos(filtered)
  }, [eventos, search, fecha])

  const handleUnirse = async () => {
    if (!nombre1 || !nombre2 || !eventoSeleccionado) return

    const res = await fetch(`/api/eventos/${eventoSeleccionado.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombrePareja1: nombre1, nombrePareja2: nombre2 }),
    })

    if (res.ok) {
      toast.success('Pareja registrada exitosamente')
      setNombre1('')
      setNombre2('')
      setDialogOpen(false)
    } else {
      const error = await res.json()
      toast.error(error.error || 'Error al unirse al evento')
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto bg-gradient-to-b from-green-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Unirse a un evento</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Buscar por club"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => { setSearch(''); setFecha('') }}>
          Borrar Filtros
        </Button>
      </div>

      <div className="space-y-4">
        {filteredEventos.map((evento) => (
          <div
            key={evento.id}
            className="p-4 border border-green-100 rounded-lg shadow-sm hover:bg-green-50 transition cursor-pointer flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg text-green-800">{evento.nombre}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {new Date(evento.date).toLocaleDateString('es-AR')}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {evento.startTime} - {evento.endTime}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {evento.Club.name} {evento.Club.address ? `- ${evento.Club.address}` : ''}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {evento.parejas.length}/{evento.maxParejas} parejas
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                {evento.tipo === 'torneo'
                  ? `Torneo (${evento.formato})`
                  : 'Cancha Abierta'} - {evento.genero} - Nivel {evento.categoria || 'N/D'}
              </p>
              <p className="text-sm text-green-600 font-semibold flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${evento.price}
              </p>
            </div>
            <Button onClick={() => { setEventoSeleccionado(evento); setDialogOpen(true) }}>
              Unirme
            </Button>
          </div>
        ))}

        {filteredEventos.length === 0 && (
          <p className="text-center text-gray-500">No se encontraron eventos para los filtros aplicados.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribí tu pareja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nombre jugador 1" value={nombre1} onChange={(e) => setNombre1(e.target.value)} />
            <Input placeholder="Nombre jugador 2" value={nombre2} onChange={(e) => setNombre2(e.target.value)} />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleUnirse}>Confirmar inscripción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8 text-center">
        <Link href="/menu">
          <Button variant="outline" className="bg-white hover:bg-gray-100 text-green-600 border-green-600 hover:border-green-700">
            Volver al menú
          </Button>
        </Link>
      </div>
    </main>
  )
}
