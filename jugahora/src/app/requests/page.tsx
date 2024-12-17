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

  const getToken = () => {
    return localStorage.getItem('token'); // Token JWT desde el localStorage
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const token = getToken();

      if (!token) {
        console.error('Usuario no autenticado o token inválido.');
        return;
      }

      try {
        const response = await fetch('/api/friends/list-requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Enviar token JWT en el header
          },
        });

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
    const token = getToken();
    await fetch('/api/friends/accept-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Enviar token JWT
      },
      body: JSON.stringify({ requestId }),
    });
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  const handleReject = async (requestId: number) => {
    const token = getToken();
    await fetch('/api/friends/reject-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Enviar token JWT
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
