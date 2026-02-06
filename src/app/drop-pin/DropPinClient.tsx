"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Copy, ShareNetwork, Star, NavigationArrow, MagnifyingGlass, SpinnerGap, MapPinLine, Trash } from '@phosphor-icons/react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';

interface PinData {
  lat: number;
  lng: number;
  address: string | null;
  postalCode: string | null;
  state: string | null;
  lga: string | null;
  source: 'nominatim' | 'database' | null;
  marker?: L.Marker;
}

// Nigeria bounds and center
const NIGERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.2, 2.7],
  [13.9, 14.7]
];
const NIGERIA_CENTER: L.LatLngExpression = [9.0820, 8.6753];

const DropPin = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<PinData[]>([]);
  const [currentPin, setCurrentPin] = useState<PinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Create custom marker icon
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div class="pin-marker">
          <div class="pin-head"></div>
          <div class="pin-point"></div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42]
    });
  };

  const handlePinDrop = useCallback(async (lat: number, lng: number, map: L.Map) => {
    setLoading(true);
    
    const newPin: PinData = {
      lat,
      lng,
      address: null,
      postalCode: null,
      state: null,
      lga: null,
      source: null
    };
    
    try {
      // Get address from OpenStreetMap (Nominatim)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NigerianPostalCodeFinder/1.0'
          }
        }
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        newPin.address = nominatimData.display_name || null;
        newPin.state = nominatimData.address?.state || null;
        newPin.lga = nominatimData.address?.county || nominatimData.address?.city || null;
        
        if (nominatimData.address?.postcode) {
          newPin.postalCode = nominatimData.address.postcode;
          newPin.source = 'nominatim';
        }
      }

      // Add marker to map
      const marker = L.marker([lat, lng], { icon: createCustomIcon() }).addTo(map);
      
      const popupContent = `
        <div class="pin-popup">
          <h4 style="color: hsl(152, 69%, 31%); font-weight: bold; margin-bottom: 8px;">Dropped Pin</h4>
          ${newPin.address ? `<p style="font-size: 12px; color: #666; margin-bottom: 8px;">${newPin.address.substring(0, 100)}...</p>` : ''}
          ${newPin.postalCode 
            ? `<div style="background: hsl(152, 69%, 31%, 0.1); padding: 8px; border-radius: 6px; text-align: center; margin-bottom: 8px;">
                <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: hsl(152, 69%, 31%);">${newPin.postalCode}</span>
               </div>` 
            : '<p style="font-size: 12px; color: #999; font-style: italic;">No postal code available</p>'
          }
        </div>
      `;
      
      marker.bindPopup(popupContent).openPopup();
      newPin.marker = marker;
      
      setCurrentPin(newPin);
      setPins(prev => [...prev, newPin]);
      
      if (newPin.postalCode) {
        toast.success(`Postal code found: ${newPin.postalCode}`);
      } else {
        toast.info('Location marked. Postal code not available for this area.');
      }
      
    } catch (error) {
      console.error('Error finding postal code:', error);
      newPin.address = 'Error determining location';
      setCurrentPin(newPin);
      toast.error('Error finding location details');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: NIGERIA_CENTER,
      zoom: 6,
      maxBounds: NIGERIA_BOUNDS,
      minZoom: 5,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      handlePinDrop(e.latlng.lat, e.latlng.lng, map);
    });

    mapRef.current = map;
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [handlePinDrop]);

  const removePin = useCallback((index: number) => {
    const pinToRemove = pins[index];
    if (pinToRemove?.marker && mapRef.current) {
      mapRef.current.removeLayer(pinToRemove.marker);
    }
    setPins(prev => prev.filter((_, i) => i !== index));
    if (pins[index] === currentPin) {
      setCurrentPin(null);
    }
    toast.success('Pin removed');
  }, [pins, currentPin]);

  const clearAllPins = useCallback(() => {
    pins.forEach(pin => {
      if (pin.marker && mapRef.current) {
        mapRef.current.removeLayer(pin.marker);
      }
    });
    setPins([]);
    setCurrentPin(null);
    toast.success('All pins cleared');
  }, [pins]);

  const copyToClipboard = useCallback((postalCode: string) => {
    navigator.clipboard.writeText(postalCode);
    toast.success('Postal code copied to clipboard!');
  }, []);

  const sharePostalCode = useCallback((pin: PinData) => {
    const text = `Postal Code: ${pin.postalCode}\nLocation: ${pin.address || `${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Details copied to clipboard!');
    }
  }, []);

  const saveToFavorites = useCallback((pin: PinData) => {
    const favorites = JSON.parse(localStorage.getItem('favoritePins') || '[]');
    favorites.push({
      lat: pin.lat,
      lng: pin.lng,
      address: pin.address,
      postalCode: pin.postalCode,
      state: pin.state,
      lga: pin.lga,
      source: pin.source
    });
    localStorage.setItem('favoritePins', JSON.stringify(favorites));
    toast.success('Saved to favorites!');
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-[1000]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary/20 rounded-xl">
              <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI-based Nigeria Zip Postal Code Finder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-based, free & fast Nigeria zip postal code lookup</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/drop-pin" 
              className="text-sm text-primary font-medium"
            >
              Drop Pin
            </Link>
            <Link 
              href="/state-maps" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block"
            >
              State Maps
            </Link>
            <Link 
              href="/blog" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Blog
            </Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full mb-4 border border-primary/30">
            <MapPinLine className="h-3 w-3 text-primary" />
            <span className="text-primary font-semibold">Interactive Map</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Drop Pin Finder
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Click anywhere on the map to find the postal code for that location
          </p>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-secondary to-secondary/50 border border-border mb-6">
          <h3 className="text-sm font-semibold text-primary mb-3">How It Works:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Click anywhere on the map below</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>We'll drop a pin at that location</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Get the postal code instantly</span>
            </li>
          </ol>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-[2000]">
            <SpinnerGap className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">Finding postal code...</p>
          </div>
        )}

        {/* Map Section */}
        <div className="border-2 border-primary/30 rounded-xl overflow-hidden mb-6 shadow-lg">
          <div 
            ref={mapContainerRef} 
            className="h-[400px] md:h-[500px] w-full"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Pin Controls */}
        {pins.length > 0 && (
          <div className="flex justify-center mb-6">
            <Button variant="outline" onClick={clearAllPins} className="gap-2">
              <Trash className="h-4 w-4" />
              Clear All Pins ({pins.length})
            </Button>
          </div>
        )}

        {/* Results Display */}
        {currentPin && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              Pin Dropped Successfully
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-start py-2 border-b border-border">
                <span className="text-sm font-medium text-muted-foreground">Coordinates:</span>
                <span className="text-sm font-mono text-foreground">
                  {currentPin.lat.toFixed(6)}, {currentPin.lng.toFixed(6)}
                </span>
              </div>
              
              {currentPin.address && (
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <span className="text-sm font-medium text-muted-foreground">Address:</span>
                  <span className="text-sm text-foreground text-right max-w-[60%]">{currentPin.address}</span>
                </div>
              )}
              
              {currentPin.state && (
                <div className="flex justify-between items-start py-2 border-b border-border">
                  <span className="text-sm font-medium text-muted-foreground">State:</span>
                  <span className="text-sm text-foreground">{currentPin.state}</span>
                </div>
              )}
            </div>
            
            {currentPin.postalCode ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Postal Code:</p>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                  <span className="font-mono text-4xl font-bold text-primary">
                    {currentPin.postalCode}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center mb-4">
                  <Button onClick={() => copyToClipboard(currentPin.postalCode!)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button variant="outline" onClick={() => sharePostalCode(currentPin)} className="gap-2">
                    <ShareNetwork className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={() => saveToFavorites(currentPin)} className="gap-2">
                    <Star className="h-4 w-4" />
                    Save
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Source: {currentPin.source === 'nominatim' ? 'OpenStreetMap' : 'Database Match'}
                </p>
              </div>
            ) : (
              <div className="bg-secondary/50 border border-border rounded-xl p-6 text-center">
                <p className="text-foreground font-medium mb-2">Could not determine postal code</p>
                <p className="text-sm text-muted-foreground mb-4">
                  This area may not have an assigned postal code, or it's in a remote location.
                </p>
                <Button asChild variant="outline">
                  <Link href="/">
                    <MagnifyingGlass className="h-4 w-4 mr-2" />
                    Try Manual Search Instead
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Alternative Methods */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Other Ways to Find Your Postal Code:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <NavigationArrow className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">GPS Detection</h4>
              <p className="text-sm text-muted-foreground mb-4">Let us detect your location automatically</p>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/">Use GPS</Link>
              </Button>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MagnifyingGlass className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Manual Search</h4>
              <p className="text-sm text-muted-foreground mb-4">Select your location from dropdowns</p>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/">Manual Search</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 md:py-12 bg-card/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">AI-based Nigeria Zip Postal Code Finder</h3>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-based Nigeria zip postal code lookup using GPS or smart search.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
                <Link href="/drop-pin" className="text-sm text-muted-foreground hover:text-primary transition-colors">Drop Pin</Link>
                <Link href="/state-maps" className="text-sm text-muted-foreground hover:text-primary transition-colors">State Maps</Link>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/blog/nipost-services-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">NIPOST Guide</Link>
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping Nigerians find accurate postal codes since 2024.
              </p>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-6">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              (c) {new Date().getFullYear()} AI-based Nigeria Zip Postal Code Finder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom marker styles */}
      <style>{`
        .custom-pin-marker {
          background: transparent;
          border: none;
        }
        
        .pin-marker {
          position: relative;
          width: 30px;
          height: 42px;
        }
        
        .pin-head {
          width: 24px;
          height: 24px;
          background: hsl(152, 69%, 31%);
          border: 3px solid white;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 3px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        
        .pin-point {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 18px solid hsl(152, 69%, 31%);
          position: absolute;
          bottom: 0;
          left: 7px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        
        .leaflet-popup-content {
          margin: 8px 12px;
        }
        
        .pin-popup {
          min-width: 200px;
        }
      `}</style>
    </div>
  );
};

export default DropPin;
