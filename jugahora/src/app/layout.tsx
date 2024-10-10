import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "JugáHora - Reserva y Únete a Partidos de Pádel",
  description: "Reserva canchas de pádel o únete a partidos existentes en tu área con JugáHora. Juega cuando quieras, donde quieras.",
  verification: {
    google: '1Cq72fol-031V-8akJf5Q5y93beVuAV4l-zxyXXZzk0',
  },
  icons: {
    icon: '/favicon.ico',  // Ruta al favicon en la carpeta 'public'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
