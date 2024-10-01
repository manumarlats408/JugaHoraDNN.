import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const clubs = [
  'Pasaje del sol - GEBA',
  'Lasaigues Club - Canning',
  'Palmeras Club',
  'World Padel Center - CABA',
  'Premium APA center',
]

export default function JuegaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Juega un partido</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Conecta con gente en el club que desees!</p>
          <div className="space-y-4">
            {clubs.map((club, index) => (
              <div key={index} className="flex items-center space-x-4 p-2 border rounded-lg">
                <Image src="/placeholder.svg" alt={club} width={50} height={50} className="rounded-full" />
                <div>
                  <p className="font-semibold">{club}</p>
                  <p className="text-sm text-gray-500">Grupo de whatsapp</p>
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