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

  // Función para obtener el token de las cookies
  const getTokenFromCookies = () => {
    const cookieHeader = document.cookie;
    console.log("Cookies obtenidas:", cookieHeader); // Log para depuración
    const token = cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    console.log("Token extraído de cookies:", token); // Verificar el token
    return token;
  };

  useEffect(() => {
    const fetchRequests = async () => {
        try {
          const response = await fetch('/api/friends/list-requests', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Importante: Enviar cookies HTTP-only
          });
      
          console.log("Respuesta completa del servidor:", response);
          if (response.ok) {
            const data = await response.json();
            console.log("Solicitudes recibidas:", data);
            setRequests(data);
          } else {
            console.error('Error al obtener las solicitudes. Estado:', response.status);
            const errorDetail = await response.json();
            console.error('Detalle del error:', errorDetail);
          }
        } catch (error) {
          console.error('Error general:', error);
        }
      };
      
      

    fetchRequests();
  }, []);

  const handleAccept = async (requestId: number) => {
    const token = getTokenFromCookies();
    console.log(`Enviando solicitud de aceptación para requestId: ${requestId}`);

    try {
      const response = await fetch('/api/friends/accept-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Enviar el token JWT
        },
        body: JSON.stringify({ requestId }),
      });

      console.log('Respuesta al aceptar solicitud:', response);

      if (response.ok) {
        console.log(`Solicitud aceptada correctamente (requestId: ${requestId})`);
        setRequests(requests.filter((req) => req.id !== requestId));
      } else {
        console.error('Error al aceptar solicitud. Código de estado:', response.status);
      }
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
    }
  };

  const handleReject = async (requestId: number) => {
    const token = getTokenFromCookies();
    console.log(`Enviando solicitud de rechazo para requestId: ${requestId}`);

    try {
      const response = await fetch('/api/friends/reject-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Enviar el token JWT
        },
        body: JSON.stringify({ requestId }),
      });

      console.log('Respuesta al rechazar solicitud:', response);

      if (response.ok) {
        console.log(`Solicitud rechazada correctamente (requestId: ${requestId})`);
        setRequests(requests.filter((req) => req.id !== requestId));
      } else {
        console.error('Error al rechazar solicitud. Código de estado:', response.status);
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
    }
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
