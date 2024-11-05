'use client';

import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Trash2, Edit, Users, Clock, MapPin, Bell } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function ClubDashboard() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [matches, setMatches] = useState([
    { id: 1, date: '2024-03-15', time: '18:00', court: 'Cancha 1', players: 2 },
    { id: 2, date: '2024-03-16', time: '20:00', court: 'Cancha 2', players: 4 },
    { id: 3, date: '2024-03-17', time: '19:30', court: 'Cancha 3', players: 3 },
  ]);
  const [newMatch, setNewMatch] = useState({ date: '', time: '', court: '' });
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      });
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCreateMatch = async () => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch),
      });

      if (response.ok) {
        const createdMatch = await response.json();
        setMatches([...matches, createdMatch]); // Añadimos el nuevo partido a la lista
        setNewMatch({ date: '', time: '', court: '' }); // Limpiamos el formulario
      } else {
        console.error('Error al crear el partido:', await response.text());
      }
    } catch (error) {
      console.error('Error al conectar con la API para crear el partido:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewMatch((prev) => ({ ...prev, [id]: value }));
  };

  const handleDeleteMatch = (id: number) => {
    setMatches(matches.filter(match => match.id !== id));
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setCurrentDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setCurrentDate(value[0]);
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const matchDate = matches.find(match => new Date(match.date).toDateString() === date.toDateString());
      return matchDate ? 'bg-green-200' : null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link className="flex items-center justify-center" href="/">
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} /> 
          <span className="ml-2 text-xl font-bold">JugáHora</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaciones</span>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>
              </Button>
            }
          >
            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div className="font-medium">Notificaciones</div>
            </div>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Nuevo partido creado</span>
                <span className="text-sm text-gray-500">Cancha 1, hoy a las 18:00</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Recordatorio: Mantenimiento</span>
                <span className="text-sm text-gray-500">Cancha 3, mañana a las 10:00</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Partido cancelado</span>
                <span className="text-sm text-gray-500">Cancha 2, 20/03 a las 19:00</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenu>
          <button
            className="text-sm font-medium hover:underline underline-offset-4"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard del Club</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Crear Partido</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Partido</DialogTitle>
                <DialogDescription>
                  Ingresa los detalles del nuevo partido aquí. Haz clic en guardar cuando hayas terminado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Fecha</Label>
                  <Input id="date" type="date" className="col-span-3" value={newMatch.date} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Hora</Label>
                  <Input id="time" type="time" className="col-span-3" value={newMatch.time} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="court" className="text-right">Cancha</Label>
                  <Input id="court" className="col-span-3" value={newMatch.court} onChange={handleInputChange} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMatch}>Guardar Partido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Partidos</CardTitle>
              <CardDescription>Vista mensual de los partidos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                value={currentDate}
                onChange={handleDateChange}
                tileClassName={tileClassName}
              />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Partidos Próximos</CardTitle>
              <CardDescription>Administra los partidos programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map(match => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="font-medium">{match.date}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-1 h-4 w-4" />
                          {match.time}
                          <MapPin className="ml-2 mr-1 h-4 w-4" />
                          {match.court}
                          <Users className="ml-2 mr-1 h-4 w-4" />
                          {match.players}/4
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Club</CardTitle>
            <CardDescription>Resumen de la actividad del club</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <h3 className="text-2xl font-bold">24</h3>
                <p className="text-sm text-gray-500">Partidos esta semana</p>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <h3 className="text-2xl font-bold">87%</h3>
                <p className="text-sm text-gray-500">Ocupación de canchas</p>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <h3 className="text-2xl font-bold">152</h3>
                <p className="text-sm text-gray-500">Jugadores activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          © 2024 JugáHora. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}