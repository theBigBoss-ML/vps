import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Map, Download, ZoomIn, ZoomOut, RotateCcw, Loader2, Info, Navigation } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/finder/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';

const stateMapData = [
  { id: 'abia', name: 'Abia', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Abia.jpg' },
  { id: 'adamawa', name: 'Adamawa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Adamawa.jpg' },
  { id: 'akwa-ibom', name: 'Akwa Ibom', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Akwa_Ibom.jpg' },
  { id: 'anambra', name: 'Anambra', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Anambra.jpg' },
  { id: 'bauchi', name: 'Bauchi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Bauchi.jpg' },
  { id: 'bayelsa', name: 'Bayelsa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Bayelsa.jpg' },
  { id: 'benue', name: 'Benue', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/benue.jpg' },
  { id: 'borno', name: 'Borno', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/BORNO.jpg' },
  { id: 'cross-river', name: 'Cross River', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/cross_river.jpg' },
  { id: 'delta', name: 'Delta', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/DELTA.jpg' },
  { id: 'ebonyi', name: 'Ebonyi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/EBONYI.jpg' },
  { id: 'edo', name: 'Edo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/EDO.jpg' },
  { id: 'ekiti', name: 'Ekiti', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/ekiti.jpg' },
  { id: 'enugu', name: 'Enugu', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/ENUGU.jpg' },
  { id: 'fct', name: 'Federal Capital Territory (FCT)', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/FCT-Abuja.jpg' },
  { id: 'gombe', name: 'Gombe', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Gombe.jpg' },
  { id: 'imo', name: 'Imo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/IMO.jpg' },
  { id: 'jigawa', name: 'Jigawa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/JIgawa.jpg' },
  { id: 'kaduna', name: 'Kaduna', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kaduna.jpg' },
  { id: 'kano', name: 'Kano', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kano.jpg' },
  { id: 'katsina', name: 'Katsina', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/KATSINA.jpg' },
  { id: 'kebbi', name: 'Kebbi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kebbi.jpg' },
  { id: 'kogi', name: 'Kogi', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kogi.jpg' },
  { id: 'kwara', name: 'Kwara', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Kwara.jpg' },
  { id: 'lagos', name: 'Lagos', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Lagos.jpg' },
  { id: 'nasarawa', name: 'Nasarawa', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Nassarawa.jpg' },
  { id: 'niger', name: 'Niger', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/NIGER.jpg' },
  { id: 'ogun', name: 'Ogun', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Ogun.jpg' },
  { id: 'ondo', name: 'Ondo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Ondo.jpg' },
  { id: 'osun', name: 'Osun', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Osun.jpg' },
  { id: 'oyo', name: 'Oyo', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Oyo.jpg' },
  { id: 'plateau', name: 'Plateau', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/plateau.jpg' },
  { id: 'rivers', name: 'Rivers', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/Rivers.jpg' },
  { id: 'sokoto', name: 'Sokoto', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/SOKOTO.jpg' },
  { id: 'taraba', name: 'Taraba', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/taraba.jpg' },
  { id: 'yobe', name: 'Yobe', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/aYOBE.jpg' },
  { id: 'zamfara', name: 'Zamfara', mapUrl: 'https://web.archive.org/web/20090519191323im_/http://www.nipost.gov.ng/images/maps/YOBE2.jpg' },
];

const StateMaps = () => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [stateMapUrl, setStateMapUrl] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setMapLoaded(false);
    setImageError(false);
  };

  const loadMap = () => {
    if (!selectedState) {
      toast.error('Please select a state first');
      return;
    }
    
    const state = stateMapData.find(s => s.id === selectedState);
    if (state) {
      setIsLoadingMap(true);
      setImageError(false);
      setStateMapUrl(state.mapUrl);
      setSelectedStateName(state.name);
    }
  };

  const handleImageLoad = () => {
    setIsLoadingMap(false);
    setMapLoaded(true);
    toast.success(`${selectedStateName} postal code map loaded!`);
  };

  const handleImageError = () => {
    setIsLoadingMap(false);
    setImageError(true);
    toast.error('Failed to load map. Please try again.');
  };

  const downloadMap = async () => {
    try {
      toast.info('Starting download...');
      const response = await fetch(stateMapUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedStateName.replace(/\s+/g, '-').toLowerCase()}-postal-map.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Map downloaded!');
    } catch {
      // Fallback: open in new tab
      window.open(stateMapUrl, '_blank');
      toast.info('Map opened in new tab for download');
    }
  };

  const resetView = () => {
    setMapLoaded(false);
    setSelectedState('');
    setStateMapUrl('');
    setSelectedStateName('');
    setImageError(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-nigeria-green/20 rounded-xl">
              <MapPin className="h-6 w-6 text-nigeria-green" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI-based Nigeria Zip Postal Code Finder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Free & fast Nigeria zip postal code lookup</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-nigeria-green transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/state-maps" 
              className="text-sm text-nigeria-green font-medium"
            >
              State Maps
            </Link>
            <Link 
              to="/blog" 
              className="text-sm text-muted-foreground hover:text-nigeria-green transition-colors"
            >
              Blog
            </Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-nigeria-orange/10 text-nigeria-orange text-xs font-medium rounded-full mb-4">
            <Map className="h-3 w-3" />
            Official NIPOST Maps
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            State Postal Code Finder (by Map)
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            View official NIPOST maps showing postal codes for any Nigerian state. 
            Zoom and pan to explore postal codes for specific areas.
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-primary/20 shrink-0">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-foreground/80">
              Select a state below to view its detailed postal code map. 
              Use zoom controls to see postal codes for specific areas.
            </p>
          </div>
        </div>

        {/* State Selector */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">
              Select State:
            </label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="-- Choose a State --" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] bg-popover border border-border z-50">
                {stateMapData.map(state => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={loadMap}
            disabled={!selectedState || isLoadingMap}
            className="w-full sm:w-auto gap-2 bg-nigeria-green hover:bg-nigeria-green/90"
          >
            {isLoadingMap ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Map className="h-4 w-4" />
            )}
            View Map
          </Button>
        </div>

        {/* Instructions (shown before map loads) */}
        {!mapLoaded && !isLoadingMap && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-nigeria-orange/10 to-nigeria-orange/5 border border-nigeria-orange/20">
            <h3 className="text-lg font-semibold text-nigeria-orange mb-4">How to Use:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="text-lg">📌</span>
                <span>Select your state from the dropdown above</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="text-lg">🗺️</span>
                <span>Click "View Map" to load the postal code map</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="text-lg">🔍</span>
                <span>Use [+] [-] buttons to zoom in and out</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="text-lg">↔️</span>
                <span>Click and drag to pan around the map</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="text-lg">📮</span>
                <span>Postal codes are marked on the map</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="text-lg">💾</span>
                <span>Download the map for offline reference</span>
              </li>
            </ul>
          </div>
        )}

        {/* Loading State */}
        {isLoadingMap && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-12 w-12 text-nigeria-green animate-spin" />
            <p className="text-muted-foreground">Loading {selectedStateName} postal code map...</p>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-destructive font-medium mb-4">Failed to load the map image.</p>
            <Button variant="outline" onClick={loadMap}>
              Try Again
            </Button>
          </div>
        )}

        {/* Map Display Area */}
        {(stateMapUrl && !imageError) && (
          <div className={`space-y-6 ${isLoadingMap ? 'hidden' : ''}`}>
            {/* Map Title */}
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-nigeria-green flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedStateName} State Postal Code Map
              </h3>
            </div>

            {/* Map Container with Zoom/Pan */}
            <div className="border-2 border-nigeria-green/30 rounded-xl overflow-hidden bg-muted/30 shadow-lg">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    {/* Map Controls */}
                    <div className="flex flex-wrap gap-2 justify-center p-3 bg-card/80 border-b border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => zoomIn()}
                        className="gap-2"
                      >
                        <ZoomIn className="h-4 w-4" />
                        Zoom In
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => zoomOut()}
                        className="gap-2"
                      >
                        <ZoomOut className="h-4 w-4" />
                        Zoom Out
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resetTransform()}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadMap}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    
                    {/* Map Image */}
                    <div className="flex items-center justify-center min-h-[400px] max-h-[700px] overflow-hidden">
                      <TransformComponent>
                        <img 
                          src={stateMapUrl} 
                          alt={`${selectedStateName} State Postal Code Map`}
                          className="max-w-full h-auto"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      </TransformComponent>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>

            {/* Map Information Panel */}
            {mapLoaded && (
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <h4 className="text-lg font-semibold text-nigeria-green">About This Map</h4>
                <p className="text-sm text-muted-foreground">
                  This is the official NIPOST postal code map for {selectedStateName} State. 
                  The map shows Local Government Areas (LGAs) and their corresponding postal codes.
                </p>
                
                {/* Map Legend */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h5 className="text-sm font-semibold text-foreground mb-3">Map Legend:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🗺️</span>
                      <span>Colored regions: Different LGAs</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📮</span>
                      <span>Numbers on map: Postal codes</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🛣️</span>
                      <span>Boundary lines: LGA borders</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={resetView}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    View Different State
                  </Button>
                  <Button 
                    asChild
                    className="gap-2 bg-nigeria-orange hover:bg-nigeria-orange/90"
                  >
                    <Link to="/">
                      <Navigation className="h-4 w-4" />
                      Use GPS Detection Instead
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 md:py-12 bg-card/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <div className="p-1.5 bg-nigeria-green/20 rounded-lg">
                  <MapPin className="h-4 w-4 text-nigeria-green" />
                </div>
                <h3 className="text-sm font-bold text-foreground">AI-based Nigeria Zip Postal Code Finder</h3>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Free & fast Nigeria zip postal code lookup using GPS or smart search.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="text-sm text-muted-foreground hover:text-nigeria-green transition-colors">Home</Link>
                <Link to="/state-maps" className="text-sm text-muted-foreground hover:text-nigeria-green transition-colors">State Maps</Link>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-nigeria-green transition-colors">Blog</Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/blog/nipost-services-guide" className="text-sm text-muted-foreground hover:text-nigeria-green transition-colors">NIPOST Guide</Link>
              </nav>
            </div>

            {/* About */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping Nigerians find accurate postal codes since 2024.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/50 mt-8 pt-6">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} AI-based Nigeria Zip Postal Code Finder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StateMaps;
