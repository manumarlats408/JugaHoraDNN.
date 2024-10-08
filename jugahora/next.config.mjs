/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: "/(.*)", // Aplica las cabeceras a todas las rutas
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none';", // CSP ajustado
          },
          {
            key: "X-Frame-Options",
            value: "DENY", // Previene ataques de clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Evita la adivinación del tipo de contenido
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer", // Controla la información enviada en el header Referer
          },
        ],
      },
    ];
  },
};

export default nextConfig;
