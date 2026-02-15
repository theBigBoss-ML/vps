import { useState, useCallback, useRef, useEffect } from 'react';
import { MagnifyingGlass, MapPin, X, SpinnerGap } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SmartSearchResult {
  postalCode: string;
  area: string;
  locality: string;
  lga: string;
  state: string;
}

interface SmartSearchProps {
  onSelect: (result: SmartSearchResult) => void;
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

export function SmartSearch({ onSelect, isLoading }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
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
      const response = await fetch('/api/lookup/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'autocomplete', input }),
      });
      const data = await response.json();

      if (data?.predictions?.length) {
        setPredictions(data.predictions.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setPredictions([]);
    } finally {
      setIsFetchingPlaces(false);
    }
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (value.length >= 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchPlacePredictions(value);
      }, 300);
      setShowSuggestions(true);
    } else {
      setPredictions([]);
      setShowSuggestions(false);
    }
  }, [fetchPlacePredictions]);

  const handleSelectPlace = useCallback(async (prediction: PlacePrediction) => {
    setQuery(prediction.structured_formatting?.main_text || prediction.description);
    setShowSuggestions(false);
    setIsFetchingPlaces(true);

    try {
      const response = await fetch('/api/lookup/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'details', place_id: prediction.place_id }),
      });
      const data = await response.json();

      if (data?.result?.postalCode) {
        const result: SmartSearchResult = {
          postalCode: data.result.postalCode,
          area: prediction.structured_formatting?.main_text || data.result.locality || '',
          locality: data.result.locality || '',
          lga: data.result.lga || '',
          state: data.result.state || '',
        };

        setQuery('');
        setPredictions([]);
        onSelect(result);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsFetchingPlaces(false);
    }
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const totalItems = predictions.length;

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
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSelectPlace(predictions[selectedIndex]);
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

  const hasResults = predictions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-nigeria-green/40 to-primary/50 rounded-xl blur-md opacity-75 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary z-10" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => hasResults && setShowSuggestions(true)}
            placeholder="Type a location name e.g. Lekki, Ikeja..."
            className="pl-12 pr-10 h-14 text-base rounded-xl border-2 border-primary bg-background focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/70 transition-all shadow-lg relative"
            disabled={isLoading}
            aria-label="Search for Nigeria zip postal code by location"
            aria-autocomplete="list"
            aria-controls="smart-search-suggestions"
            aria-expanded={showSuggestions}
          />
        </div>
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
              <SpinnerGap className="h-4 w-4 animate-spin" />
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
          <div className="p-2 border-b border-border bg-muted/30">
            <p className="text-xs text-muted-foreground px-2">
              Google Places suggestions
            </p>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li
                key={`google-${prediction.place_id}`}
                role="option"
                aria-selected={selectedIndex === index}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0",
                  selectedIndex === index
                    ? "bg-nigeria-green/10"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleSelectPlace(prediction)}
                onMouseEnter={() => setSelectedIndex(index)}
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
            ))}
          </ul>
        </div>
      )}

      {showSuggestions && !hasResults && query.length >= 2 && !isFetchingPlaces && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">No suggestions found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
