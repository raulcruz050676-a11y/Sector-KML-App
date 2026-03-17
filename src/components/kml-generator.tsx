"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Copy, Download, MapPin, Radio, Compass, Wifi, Share2, Eraser } from 'lucide-react';
import { Antenna, generateKML } from '@/lib/kml-utils';
import { useToast } from '@/hooks/use-toast';

export function KMLGenerator() {
  const { toast } = useToast();
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [formState, setFormState] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '0.5',
    azimuth: '0',
    beamwidth: '65',
  });
  
  const [kmlOutput, setKmlOutput] = useState('');

  // Cargar datos guardados con la nueva clave de almacenamiento
  useEffect(() => {
    const saved = localStorage.getItem('sector_kml_data');
    if (saved) {
      try {
        setAntennas(JSON.parse(saved));
      } catch (e) {
        // Intento de migración si existía el nombre anterior
        const oldSaved = localStorage.getItem('kml_craft_antennas');
        if (oldSaved) {
          try { setAntennas(JSON.parse(oldSaved)); } catch (err) {}
        }
      }
    }
    setIsLoaded(true);
    setFormState(prev => ({ ...prev, name: 'Sector 1' }));
  }, []);

  // Guardar datos automáticamente
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sector_kml_data', JSON.stringify(antennas));
      setKmlOutput(generateKML(antennas));
    }
  }, [antennas, isLoaded]);

  const handleAddAntenna = () => {
    const lat = parseFloat(formState.latitude);
    const lon = parseFloat(formState.longitude);
    const rad = parseFloat(formState.radius);
    const az = parseFloat(formState.azimuth);
    const beam = parseFloat(formState.beamwidth);
    
    if (isNaN(lat) || isNaN(lon) || formState.latitude === '' || formState.longitude === '') {
      toast({
        variant: "destructive",
        title: "Error de datos",
        description: "Por favor ingresa coordenadas válidas. Usa el punto para decimales.",
      });
      return;
    }

    const newAntenna: Antenna = {
      id: Math.random().toString(36).substr(2, 9),
      name: formState.name || `Sector ${antennas.length + 1}`,
      latitude: lat,
      longitude: lon,
      radius: isNaN(rad) ? 0.1 : rad,
      azimuth: isNaN(az) ? 0 : az,
      beamwidth: isNaN(beam) ? 65 : beam,
    };
    
    setAntennas([...antennas, newAntenna]);
    setFormState(prev => ({ ...prev, name: `Sector ${antennas.length + 2}` }));

    toast({
      title: "Sector agregado",
      description: `${newAntenna.name} se ha añadido a la lista.`,
    });
  };

  const removeAntenna = (id: string) => {
    setAntennas(antennas.filter(a => a.id !== id));
  };

  const clearAll = () => {
    if (confirm("¿Estás seguro de que quieres borrar TODA la lista?")) {
      setAntennas([]);
      toast({
        title: "Lista vaciada",
        description: "Se han eliminado todos los registros.",
      });
    }
  };

  const copyToClipboard = () => {
    if (!kmlOutput) return;
    navigator.clipboard.writeText(kmlOutput);
    toast({
      title: "¡Copiado!",
      description: "El código KML está en tu portapapeles.",
    });
  };

  const downloadKML = () => {
    if (!kmlOutput) return;
    const blob = new Blob([kmlOutput], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sectores_antena.kml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sector KML',
          text: 'Usa esta herramienta para generar sectores de antenas para Google Earth.',
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error compartiendo:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Enlace copiado",
        description: "Pégalo en WhatsApp para compartir la App.",
      });
    }
  };

  const updateField = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 md:p-8 pb-20">
      <header className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Sector KML</h1>
          <p className="text-muted-foreground mt-1">Generador de geometrías para sectores de antena.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShareApp} className="w-fit border-primary text-primary hover:bg-primary/5">
          <Share2 className="w-4 h-4 mr-2" /> Compartir App
        </Button>
      </header>

      <Card className="shadow-md border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Configuración del Sector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Sector</Label>
              <Input
                id="name"
                placeholder="ej. Sector Norte"
                value={formState.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat" className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Latitud</Label>
              <Input
                id="lat"
                type="text"
                placeholder="-34.6037"
                value={formState.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lon" className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Longitud</Label>
              <Input
                id="lon"
                type="text"
                placeholder="-58.3816"
                value={formState.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="radius" className="flex items-center gap-1"><Wifi className="w-3 h-3"/> Radio (km)</Label>
              <Input
                id="radius"
                type="text"
                value={formState.radius}
                onChange={(e) => updateField('radius', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="azimuth" className="flex items-center gap-1"><Compass className="w-3 h-3"/> Azimut (°)</Label>
              <Input
                id="azimuth"
                type="text"
                value={formState.azimuth}
                onChange={(e) => updateField('azimuth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beamwidth" className="flex items-center gap-1"><Compass className="w-3 h-3"/> Apertura (°)</Label>
              <Input
                id="beamwidth"
                type="text"
                value={formState.beamwidth}
                onChange={(e) => updateField('beamwidth', e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAddAntenna} className="w-full mt-2 font-medium">
            <Plus className="w-4 h-4 mr-2" /> Agregar a la Lista
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-headline">Sectores Guardados ({antennas.length})</CardTitle>
          {antennas.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive">
              <Eraser className="w-4 h-4 mr-2" /> Borrar Todo
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] pr-4">
            {antennas.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                La lista está vacía. Agrega sectores para verlos aquí.
              </div>
            ) : (
              <ul className="space-y-2">
                {antennas.map((ant) => (
                  <li key={ant.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group hover:border-primary/20 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{ant.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {ant.latitude}, {ant.longitude} | {ant.radius}km | {ant.azimuth}°
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeAntenna(ant.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-headline">Salida KML (Opacidad 40%)</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!kmlOutput}>
              <Copy className="w-4 h-4 mr-2" /> Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={downloadKML} disabled={!kmlOutput}>
              <Download className="w-4 h-4 mr-2" /> Descargar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value={kmlOutput}
            className="font-code h-[150px] text-xs resize-none bg-muted/50 focus:ring-0"
            placeholder="El código aparecerá aquí..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
