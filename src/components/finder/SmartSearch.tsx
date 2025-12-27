import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { defaultPostalCodes, PostalCode } from '@/data/postalCodes';
import { cn } from '@/lib/utils';

interface SmartSearchProps {
  onSelect: (result: PostalCode) => void;
  isLoading: boolean;
}

// Common abbreviations and variations
const abbreviations: Record<string, string[]> = {
  'vi': ['victoria island'],
  'gra': ['government reservation area', 'government reserved area'],
  'lga': ['local government area'],
  'brt': ['bus rapid transit'],
  'unilag': ['university of lagos'],
  'luth': ['lagos university teaching hospital'],
  'fct': ['federal capital territory'],
  'vgc': ['victoria garden city'],
};

// Fuzzy match function
function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  // Exact match
  if (t === q) return 100;
  
  // Contains query
  if (t.includes(q)) return 80 + (q.length / t.length) * 10;
  
  // Query contains target
  if (q.includes(t)) return 70;
  
  // Check for abbreviations
  const expandedTerms = abbreviations[q] || [];
  for (const expanded of expandedTerms) {
    if (t.includes(expanded)) return 85;
  }
  
  // Levenshtein-like similarity for typos
  const words = q.split(/\s+/);
  const targetWords = t.split(/\s+/);
  let matchedWords = 0;
  
  for (const word of words) {
    for (const tWord of targetWords) {
      if (tWord.includes(word) || word.includes(tWord)) {
        matchedWords++;
        break;
      }
      // Simple typo tolerance (first 3 chars match)
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

function searchPostalCodes(query: string): Array<PostalCode & { score: number; matchedOn: string }> {
  if (!query || query.length < 2) return [];
  
  const results: Array<PostalCode & { score: number; matchedOn: string }> = [];
  const seenCodes = new Set<string>();
  
  for (const pc of defaultPostalCodes) {
    // Search across all relevant fields
    const fields = [
      { name: 'area', value: pc.area },
      { name: 'locality', value: pc.locality },
      { name: 'lga', value: pc.lga },
      { name: 'state', value: pc.state },
      { name: 'street', value: pc.street || '' },
    ];
    
    let bestScore = 0;
    let matchedOn = '';
    
    for (const field of fields) {
      if (!field.value) continue;
      const score = fuzzyMatch(query, field.value);
      if (score > bestScore) {
        bestScore = score;
        matchedOn = field.name;
      }
    }
    
    // Also check combined strings
    const combinedArea = `${pc.area} ${pc.locality}`;
    const combinedFull = `${pc.locality} ${pc.area} ${pc.lga} ${pc.state}`;
    
    const combinedScore = Math.max(
      fuzzyMatch(query, combinedArea),
      fuzzyMatch(query, combinedFull)
    );
    
    if (combinedScore > bestScore) {
      bestScore = combinedScore;
      matchedOn = 'combined';
    }
    
    // Unique key to avoid duplicates
    const uniqueKey = `${pc.postalCode}-${pc.area}`;
    
    if (bestScore >= 30 && !seenCodes.has(uniqueKey)) {
      seenCodes.add(uniqueKey);
      results.push({ ...pc, score: bestScore, matchedOn });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, 8);
}

export function SmartSearch({ onSelect, isLoading }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<PostalCode & { score: number; matchedOn: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length >= 2) {
      const results = searchPostalCodes(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleSelect = useCallback((result: PostalCode) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(result);
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
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
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Type location: Lekki Phase 1, Victoria Island, Ikeja GRA..."
          className="pl-12 pr-10 h-14 text-base rounded-xl border-2 border-border focus:border-nigeria-green transition-colors"
          disabled={isLoading}
          aria-label="Search for Nigeria zip postal code by location"
          aria-autocomplete="list"
          aria-controls="smart-search-suggestions"
          aria-expanded={showSuggestions}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <div
          id="smart-search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="p-2 border-b border-border bg-muted/30">
            <p className="text-xs text-muted-foreground px-2">
              {suggestions.length} Nigeria zip postal code{suggestions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {suggestions.map((result, index) => (
              <li
                key={`${result.id}-${index}`}
                role="option"
                aria-selected={selectedIndex === index}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0",
                  selectedIndex === index 
                    ? "bg-nigeria-green/10" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleSelect(result)}
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
        </div>
      )}

      <p className="mt-3 text-xs text-center text-muted-foreground">
        Try: "VI", "Lekki", "Ikeja GRA", "Surulere", "Ajah"
      </p>
    </div>
  );
}