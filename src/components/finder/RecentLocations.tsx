import { Clock, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecentLocation } from '@/types/location';

interface RecentLocationsProps {
  locations: RecentLocation[];
  onSelect: (location: RecentLocation) => void;
  onClear: () => void;
}

export function RecentLocations({ locations, onSelect, onClear }: RecentLocationsProps) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Recent Searches
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-destructive"
          aria-label="Clear recent searches"
        >
          <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" />
          Clear
        </Button>
      </div>
      
      <div className="space-y-2">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => onSelect(location)}
            className="w-full p-3 rounded-lg bg-card border border-border hover:border-nigeria-green/50 hover:bg-muted/50 transition-all text-left group"
            aria-label={`Use postal code ${location.postalCode} for ${location.area || location.lga}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-nigeria-green/10 text-nigeria-green group-hover:bg-nigeria-green/20 transition-colors">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-mono font-semibold text-foreground">
                    {location.postalCode}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {location.area || location.lga || location.address}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimeAgo(location.timestamp)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
