export interface Antenna {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // en kilómetros
  azimuth: number; // en grados
  beamwidth: number; // en grados
}

const toRadians = (deg: number) => (deg * Math.PI) / 180;
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

function getPoint(lat: number, lon: number, radiusInMeters: number, bearing: number) {
  const R = 6371000; // Radio de la Tierra en metros
  const lat1 = toRadians(lat);
  const lon1 = toRadians(lon);
  const brng = toRadians(bearing);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(radiusInMeters / R) +
      Math.cos(lat1) * Math.sin(radiusInMeters / R) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(radiusInMeters / R) * Math.cos(lat1),
      Math.cos(radiusInMeters / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return `${toDegrees(lon2)},${toDegrees(lat2)},0`;
}

export function generateKML(antennas: Antenna[]): string {
  // Opacidad del 40% (valor alfa '66')
  const styles = `
    <Style id="sector_green">
      <LineStyle><color>ff000000</color><width>2</width></LineStyle>
      <PolyStyle><color>6600ff00</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>
    <Style id="sector_blue">
      <LineStyle><color>ff000000</color><width>2</width></LineStyle>
      <PolyStyle><color>66ff0000</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>
  `;

  const placemarks = antennas.map((ant, index) => {
    const styleId = index % 2 === 0 ? 'sector_green' : 'sector_blue';
    const startAngle = ant.azimuth - ant.beamwidth / 2;
    const endAngle = ant.azimuth + ant.beamwidth / 2;
    const steps = 30;
    const radiusInMeters = ant.radius * 1000;
    
    let coords = `${ant.longitude},${ant.latitude},0 `;
    for (let i = 0; i <= steps; i++) {
      const bearing = startAngle + (i * (endAngle - startAngle)) / steps;
      coords += `${getPoint(ant.latitude, ant.longitude, radiusInMeters, bearing)} `;
    }
    coords += `${ant.longitude},${ant.latitude},0`;

    return `
    <Placemark>
      <name>${ant.name}</name>
      <styleUrl>#${styleId}</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Sectores de Antena - Sector KML</name>
    <open>1</open>
    ${styles}
    ${placemarks}
  </Document>
</kml>`;
}
