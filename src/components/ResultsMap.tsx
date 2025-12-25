import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { TestResult } from '@/types/validation';
import { TestCoordinate } from '@/data/testCoordinates';
import 'leaflet/dist/leaflet.css';

interface ResultsMapProps {
  results?: TestResult[];
  coordinates?: TestCoordinate[];
  center?: [number, number];
  zoom?: number;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export function ResultsMap({ 
  results, 
  coordinates,
  center = [6.5244, 3.3792], 
  zoom = 11 
}: ResultsMapProps) {
  const getMarkerColor = (result?: TestResult) => {
    if (!result) return '#3b82f6'; // blue for coordinates without results
    if (result.postalCodeSource === 'google') return '#10b981'; // success - green
    if (result.postalCodeSource === 'database') return '#f59e0b'; // fallback - yellow
    return '#ef4444'; // failed - red
  };

  const getTypeColor = (type: TestCoordinate['type']) => {
    switch (type) {
      case 'commercial': return '#8b5cf6'; // purple
      case 'residential': return '#3b82f6'; // blue
      case 'mixed': return '#10b981'; // green
    }
  };

  return (
    <div className="glass-card overflow-hidden h-[500px]">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ background: 'hsl(var(--card))' }}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {results && results.map((result) => (
          <CircleMarker
            key={result.id}
            center={[result.latitude, result.longitude]}
            radius={10}
            pathOptions={{
              fillColor: getMarkerColor(result),
              fillOpacity: 0.8,
              color: getMarkerColor(result),
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <div className="font-semibold">{result.locationName}</div>
                <div className="text-xs">
                  Postal Code: <span className="font-mono font-bold">{result.finalPostalCode || 'None'}</span>
                </div>
                <div className="text-xs">
                  Source: <span className="font-mono capitalize">{result.postalCodeSource}</span>
                </div>
                <div className="text-xs capitalize">
                  Status: {result.status}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {coordinates && !results && coordinates.map((coord) => (
          <CircleMarker
            key={coord.id}
            center={[coord.latitude, coord.longitude]}
            radius={8}
            pathOptions={{
              fillColor: getTypeColor(coord.type),
              fillOpacity: 0.7,
              color: getTypeColor(coord.type),
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <div className="font-semibold">{coord.name}</div>
                <div className="text-xs">{coord.area}, {coord.lga}</div>
                <div className="text-xs capitalize">Type: {coord.type}</div>
                <div className="text-xs font-mono">
                  {coord.latitude.toFixed(4)}, {coord.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3">
        <div className="text-xs font-semibold mb-2">Legend</div>
        {results ? (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Google (Direct)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span>Database (Fallback)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>Failed</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
              <span>Commercial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
              <span>Residential</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Mixed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
