import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const clubs = [
  { name: 'Pasaje del sol - GEBA', phone: '+54 9 11 5821-1410' },
  { name: 'Lasaigues Club - Canning', phone: '+54 9 11 6052-0467' },
  { name: 'Palmeras Club', phone: '+54 9 11 2494-6877' },
  { name: 'World Padel Center - CABA', phone: '+54 9 11 2334-0784' },
  { name: 'Premium APA center', phone: '+54 9 11 6350-6965' },
]

export default function ReservaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reserva tu pista</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Explora todos los clubes disponibles!</p>
          <div className="space-y-4">
            {clubs.map((club, index) => (
              <div key={index} className="flex items-center space-x-4 p-2 border rounded-lg">
                <Image src="/placeholder.svg" alt={club.name} width={50} height={50} className="rounded-full" />
                <div>
                  <p className="font-semibold">{club.name}</p>
                  <p className="text-sm text-gray-500">Número de teléfono: {club.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Link href="/menu" className="mt-4 mx-auto">
        <Button variant="outline">Volver al menú</Button>
      </Link>
    </div>
  )
}