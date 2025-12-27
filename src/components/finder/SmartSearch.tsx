import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { defaultPostalCodes, PostalCode } from '@/data/postalCodes';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SmartSearchProps {
  onSelect: (result: PostalCode) => void;
  isLoading: boolean;
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Fuzzy match function for local search fallback
function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  if (t === q) return 100;
  if (t.includes(q)) return 80 + (q.length / t.length) * 10;
  if (q.includes(t)) return 70;
  
  const words = q.split(/\s+/);
  const targetWords = t.split(/\s+/);
  let matchedWords = 0;
  
  for (const word of words) {
    for (const tWord of targetWords) {
      if (tWord.includes(word) || word.includes(tWord)) {
        matchedWords++;
        break;
      }
      if (word.length >= 3 && tWord.length >= 3 && word.slice(0, 3) === tWord.slice(0, 3)) {
        matchedWords += 0.5;
        break;
      }
    }
  }
  
  if (matchedWords > 0) {
    return Math.min(60, (matchedWords / words.length) * 60);
  }
  
  return 0;
}

function searchLocalPostalCodes(query: string): Array<PostalCode & { score: number }> {
  if (!query || query.length < 2) return [];
  
  const results: Array<PostalCode & { score: number }> = [];
  const seenCodes = new Set<string>();
  
  for (const pc of defaultPostalCodes) {
    const fields = [pc.area, pc.locality, pc.lga, pc.state, pc.street || ''];
    let bestScore = 0;
    
    for (const field of fields) {
      if (!field) continue;
      const score = fuzzyMatch(query, field);
      if (score > bestScore) bestScore = score;
    }
    
    const combinedFull = `${pc.locality} ${pc.area} ${pc.lga} ${pc.state}`;
    const combinedScore = fuzzyMatch(query, combinedFull);
    if (combinedScore > bestScore) bestScore = combinedScore;
    
    const uniqueKey = `${pc.postalCode}-${pc.area}`;
    
    if (bestScore >= 30 && !seenCodes.has(uniqueKey)) {
      seenCodes.add(uniqueKey);
      results.push({ ...pc, score: bestScore });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 8);
}

export function SmartSearch({ onSelect, isLoading }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [localResults, setLocalResults] = useState<Array<PostalCode & { score: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [useGooglePlaces, setUseGooglePlaces] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPlacePredictions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsFetchingPlaces(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { action: 'autocomplete', input },
      });
      
      if (error) {
        console.error('Edge function error:', error);
        setUseGooglePlaces(false);
        setPredictions([]);
        return;
      }
      
      if (data?.status === 'OK' && data?.predictions) {
        setPredictions(data.predictions.slice(0, 5));
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setUseGooglePlaces(false);
      setPredictions([]);
    } finally {
      setIsFetchingPlaces(false);
    }
  }, []);

  const fetchPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { action: 'details', place_id: placeId },
      });
      
      if (error) {
        console.error('Edge function error:', error);
        return null;
      }
      
      if (data?.status === 'OK' && data?.result) {
        return data.result;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      return null;
    }
    return null;
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 2) {
      // Always search local database
      const local = searchLocalPostalCodes(value);
      setLocalResults(local);
      setShowSuggestions(local.length > 0);
      
      // Try Google Places with debounce
      if (useGooglePlaces) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fetchPlacePredictions(value);
        }, 300);
      }
    } else {
      setLocalResults([]);
      setPredictions([]);
      setShowSuggestions(false);
    }
  }, [fetchPlacePredictions, useGooglePlaces]);

  const handleSelectLocal = useCallback((result: PostalCode) => {
    setQuery('');
    setLocalResults([]);
    setPredictions([]);
    setShowSuggestions(false);
    onSelect(result);
  }, [onSelect]);

  const handleSelectPlace = useCallback(async (prediction: PlacePrediction) => {
    setQuery(prediction.structured_formatting?.main_text || prediction.description);
    setShowSuggestions(false);
    setIsFetchingPlaces(true);

    const details = await fetchPlaceDetails(prediction.place_id);
    
    if (details?.address_components) {
      const postalCode = details.address_components.find(c => c.types.includes('postal_code'))?.long_name;
      const locality = details.address_components.find(c => c.types.includes('neighborhood') || c.types.includes('sublocality'))?.long_name;
      const lga = details.address_components.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
      const state = details.address_components.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
      
      if (postalCode) {
        const result: PostalCode = {
          id: `google-${prediction.place_id}`,
          postalCode,
          area: prediction.structured_formatting?.main_text || locality || '',
          locality: locality || '',
          lga: lga || '',
          state: state || 'Lagos',
        };
        
        setQuery('');
        setPredictions([]);
        setLocalResults([]);
        onSelect(result);
      }
    }
    
    setIsFetchingPlaces(false);
  }, [fetchPlaceDetails, onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    const totalItems = localResults.length + predictions.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < totalItems - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < localResults.length) {
            handleSelectLocal(localResults[selectedIndex]);
          } else {
            const predictionIndex = selectedIndex - localResults.length;
            if (predictions[predictionIndex]) {
              handleSelectPlace(predictions[predictionIndex]);
            }
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setLocalResults([]);
    setPredictions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = localResults.length > 0 || predictions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => hasResults && setShowSuggestions(true)}
          placeholder="Type location: Lekki Phase 1, Victoria Island, Ikeja GRA..."
          className="pl-12 pr-10 h-14 text-base rounded-xl border-2 border-border focus:border-nigeria-green transition-colors"
          disabled={isLoading}
          aria-label="Search for Nigeria zip postal code by location"
          aria-autocomplete="list"
          aria-controls="smart-search-suggestions"
          aria-expanded={showSuggestions}
        />
        {(query || isFetchingPlaces) && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleClear}
            aria-label="Clear search"
            disabled={isFetchingPlaces}
          >
            {isFetchingPlaces ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {showSuggestions && hasResults && (
        <div
          id="smart-search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          {localResults.length > 0 && (
            <>
              <div className="p-2 border-b border-border bg-muted/30">
                <p className="text-xs text-muted-foreground px-2">
                  {localResults.length} Nigeria zip postal code{localResults.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {localResults.map((result, index) => (
                  <li
                    key={`local-${result.id}-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0",
                      selectedIndex === index 
                        ? "bg-nigeria-green/10" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleSelectLocal(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="p-2 bg-nigeria-green/10 rounded-lg shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-nigeria-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {result.area}
                        </span>
                        <span className="px-2 py-0.5 bg-nigeria-green/20 text-nigeria-green text-xs font-mono rounded">
                          {result.postalCode}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {result.locality}, {result.lga}, {result.state}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {predictions.length > 0 && (
            <>
              <div className="p-2 border-b border-border bg-muted/30">
                <p className="text-xs text-muted-foreground px-2">
                  Google Places suggestions
                </p>
              </div>
              <ul className="max-h-40 overflow-y-auto">
                {predictions.map((prediction, index) => {
                  const adjustedIndex = localResults.length + index;
                  return (
                    <li
                      key={`google-${prediction.place_id}`}
                      role="option"
                      aria-selected={selectedIndex === adjustedIndex}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0",
                        selectedIndex === adjustedIndex 
                          ? "bg-nigeria-green/10" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handleSelectPlace(prediction)}
                      onMouseEnter={() => setSelectedIndex(adjustedIndex)}
                    >
                      <div className="p-2 bg-nigeria-green/10 rounded-lg shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-nigeria-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground truncate block">
                          {prediction.structured_formatting?.main_text || prediction.description}
                        </span>
                        {prediction.structured_formatting?.secondary_text && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {prediction.structured_formatting.secondary_text}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

    </div>
  );
}
