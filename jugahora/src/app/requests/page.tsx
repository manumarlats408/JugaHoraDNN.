'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const getTokenFromCookies = () => {
    const cookieHeader = document.cookie;
    const token = cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    return token;
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/friends/list-requests', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          console.error('Error al obtener las solicitudes:', await response.json());
        }
      } catch (error) {
        console.error('Error general:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId: number) => {
    const token = getTokenFromCookies();
    try {
      const response = await fetch('/api/friends/accept-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        setRequests(requests.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
    }
  };

  const handleReject = async (requestId: number) => {
    const token = getTokenFromCookies();
    try {
      const response = await fetch('/api/friends/reject-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        setRequests(requests.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-start">
          <Button variant="outline" onClick={() => router.push('/explore')}>
            Volver al Explorar
          </Button>
        </div>

        <Card className="shadow-md border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-xl font-bold text-green-800">Solicitudes de Amistad</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border p-4 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.sender.firstName} {request.sender.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{request.sender.email}</p>
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
              <p className="text-gray-600">No tienes solicitudes pendientes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
