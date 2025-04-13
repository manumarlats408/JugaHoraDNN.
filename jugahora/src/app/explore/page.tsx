'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [friends, setFriends] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, friendsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/friends/list-friends', { credentials: 'include' }),
        ])
  
        const users = await usersRes.json()
        const friendsData = await friendsRes.json()
  
        setProfiles(users)
        setFriends(friendsData)
  
        // Aplicar filtro inicial sin amigos
        const friendIds = new Set(friendsData.map((f: User) => f.id))
        const filtered = users.filter((profile: User) => !friendIds.has(profile.id))
        setFilteredProfiles(filtered)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }
  
    fetchData()
  }, [])

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
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)
  
    const friendIds = new Set(friends.map((f) => f.id))
    const filtered = profiles
      .filter(profile => !friendIds.has(profile.id)) // excluir amigos
      .filter(profile =>
        `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(value)
      )
  
    setFilteredProfiles(filtered)
  }
  

  if (loading) return <p className="p-4">Cargando perfiles...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/perfil')}>
            Volver al Perfil
          </Button>
          <Link href="/requests" className="text-sm font-medium text-green-700 hover:underline">
            Ver Solicitudes de Amistad
          </Link>
        </div>

        <Card className="shadow-md border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-xl font-bold text-green-800">
              Explorar Perfiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />

            {filteredProfiles.length > 0 ? (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div
                  key={profile.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border p-4 rounded-lg hover:bg-green-50 transition-colors space-y-2 sm:space-y-0"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                    <Button onClick={() => handleSendRequest(profile.id)} className="text-sm w-full sm:w-auto sm:ml-4">
                      Enviar Solicitud
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No se encontraron perfiles.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
