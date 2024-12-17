'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Request {
  id: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);

  // Función para obtener el userId desde el JWT
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id; // El campo 'id' en tu token JWT
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  };

  useEffect(() => {
    const userIdFromToken = getUserIdFromToken();
    if (!userIdFromToken) {
      console.error('Usuario no autenticado o token inválido.');
      return;
    }
  
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `/api/friends/list-requests?userId=${userIdFromToken}`, // Usar el userId directamente aquí
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          console.error('Error al obtener las solicitudes');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    fetchRequests();
  }, []);
  

  const handleAccept = async (requestId: number) => {
    await fetch('/api/friends/accept-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId }),
    });
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  const handleReject = async (requestId: number) => {
    await fetch('/api/friends/reject-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId }),
    });
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solicitudes de Amistad</h1>
      {requests.length > 0 ? (
        requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-2 shadow"
          >
            <div>
              <p>
                <strong>
                  {request.sender.firstName} {request.sender.lastName}
                </strong>{' '}
                ({request.sender.email})
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAccept(request.id)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Aceptar
              </Button>
              <Button
                onClick={() => handleReject(request.id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Rechazar
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p>No tienes solicitudes pendientes.</p>
      )}
    </div>
  );
}
