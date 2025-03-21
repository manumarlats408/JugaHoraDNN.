'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ExploreProfiles() {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Fetch de usuarios para explorar
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/users'); // Endpoint que devuelve usuarios
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error('Error al cargar los perfiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleSendRequest = async (friendId: number) => {
    try {
      const token = localStorage.getItem('token'); // Token almacenado localmente
  
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Token en el encabezado
        },
        body: JSON.stringify({ friendId }),
      });
  
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  if (loading) return <p>Cargando perfiles...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explorar Perfiles</h1>
        <Link href="/requests" className="text-sm font-medium hover:text-green-500">
            Solicitudes de Amistad
        </Link>

      {profiles.length > 0 ? (
        profiles.map((profile) => (
          <div key={profile.id} className="border-b py-2 flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
            <Button onClick={() => handleSendRequest(profile.id)} className="text-sm">
              Enviar Solicitud
            </Button>
          </div>
        ))
      ) : (
        <p>No hay perfiles disponibles.</p>
      )}
      <Button onClick={() => router.push('/perfil')} className="mt-4">
        Volver al Perfil
      </Button>
    </div>
  );
}
