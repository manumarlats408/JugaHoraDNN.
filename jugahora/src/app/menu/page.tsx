//import jwt_decode from 'jwt-decode'; // Asegúrate de instalar jwt-decode con `npm install jwt-decode`
//import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function MenuPage() {
  //const [firstName, setFirstName] = useState<string | null>(null);

  //useEffect(() => {
    // Recuperar el token de localStorage
   // const token = localStorage.getItem('token');
    //if (token) {
      // Decodificar el token JWT para obtener el nombre del usuario
     // const decoded: any = jwt_decode(token);
     // setFirstName(decoded.firstName);
   // }
  //}, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
        <CardTitle className="text-2xl font-bold">Hola Patricio!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Aprovecha nuestras funcionalidades!</p>
          <div className="space-y-4">
            <Link href="/reserva" className="block">
              <Button className="w-full">Reserva tu pista!</Button>
            </Link>
            <Link href="/jugar" className="block">
              <Button className="w-full">Juega un partido!</Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">Y preparate que próximamente habrán más...</p>
        </CardFooter>
      </Card>
    </div>
  );
}
