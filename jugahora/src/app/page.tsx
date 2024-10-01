import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">JugáHora</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4">
              <Input type="email" placeholder="Enter your email" />
              <Input type="password" placeholder="Password" />
              <Button className="w-full">NEXT</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="outline" className="w-full">
            <Image src="/apple.svg" alt="Apple logo" width={20} height={20} className="mr-2" />
            Continue with Apple
          </Button>
          <Button variant="outline" className="w-full">
            <Image src="/google.svg" alt="Google logo" width={20} height={20} className="mr-2" />
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full">
            <Image src="/facebook.svg" alt="Facebook logo" width={20} height={20} className="mr-2" />
            Continue with Facebook
          </Button>
          <Link href="/create-account" className="text-sm text-blue-600 hover:underline">
            Create a Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}