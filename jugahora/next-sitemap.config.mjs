// next-sitemap.config.mjs

export default {
    siteUrl: 'https://www.jugahora.com.ar', // Reemplaza con la URL de tu sitio
    generateRobotsTxt: true, // Genera el archivo robots.txt
    changefreq: 'daily', // Frecuencia con la que las páginas suelen cambiar
    priority: 0.7, // Prioridad de las páginas
    sitemapSize: 7000, // Tamaño máximo de URLs por archivo sitemap (opcional)
    exclude: ['/api/*'],
  };
  