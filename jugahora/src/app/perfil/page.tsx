'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

// Define la interfaz para los datos del usuario
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const menuItems = [
  { href: '/menu', label: 'Menu' },
  { href: '/perfil', label: 'Perfil' },
  { href: '/reserva', label: 'Reservar' },
  { href: '/jugar', label: 'Unirme a un partido' },
];

export default function PerfilPage() {
  const [userData, setUserData] = useState<User | null>(null);  // Cambiamos el tipo de any a User | null
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);  // Usamos la interfaz User en lugar de any
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        router.push('/login');
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Llama al endpoint de logout
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include', // Asegura que las cookies se envíen
      });

      // Redirige a la página principal después de cerrar sesión
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  if (!userData) {
    return <div>Cargando perfil...</div>;  // Mientras no hay datos, mostramos un mensaje de carga
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-sm">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <span className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
            JH
          </span>
          <span className="ml-2 text-2xl font-bold text-green-600">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}>Cerrar sesión</button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-green-600"
          onClick={() => {}}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </Button>
      </header>

      {/* Perfil del usuario */}
      <main className="flex justify-center items-center p-4 flex-1">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Perfil de {userData.firstName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Nombre:</strong> {userData.firstName} {userData.lastName}</p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © 2024 JugáHora. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs text-gray-500 hover:text-green-600 transition-colors" href="/terminos">
              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-500 hover:text-green-600 transition-colors" href="/privacidad">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
