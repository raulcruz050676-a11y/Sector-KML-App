export const dynamic = 'force-static'
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sector KML | Generador de Antenas',
    short_name: 'Sector KML',
    description: 'Genera polígonos KML para visualización geoespacial de sectores de antenas',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: 'https://picsum.photos/seed/kml1/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/kml2/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
