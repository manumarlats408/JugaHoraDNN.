'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [filteredProfiles, setFilteredProfiles] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setProfiles(data);
        setFilteredProfiles(data);
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId }),
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = profiles.filter(profile =>
      `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(value)
    );
    setFilteredProfiles(filtered);
  };

  if (loading) return <p className="p-4">Cargando perfiles...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => router.push('/perfil')}>Volver al Perfil</Button>
        <Link href="/requests" className="text-sm font-medium hover:text-green-500">
          Ver Solicitudes de Amistad
        </Link>
      </div>

      <h1 className="text-2xl font-bold mt-4">Explorar Perfiles</h1>

      <Input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={handleSearch}
        className="mt-2"
      />

      {filteredProfiles.length > 0 ? (
        filteredProfiles.map((profile) => (
          <div key={profile.id} className="border-b py-3 flex justify-between items-center">
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
        <p className="text-gray-500 mt-4">No se encontraron perfiles.</p>
      )}
    </div>
  );
}
