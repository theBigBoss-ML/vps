import { useState } from 'react';
import { TestResult } from '@/types/validation';
import { ChevronDown, ChevronUp, Check, AlertTriangle, X, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResultsTableProps {
  results: TestResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<'confidence' | 'name'>('confidence');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  const sortedResults = [...results].sort((a, b) => {
    if (sortField === 'confidence') {
      return sortDir === 'desc' ? b.confidence - a.confidence : a.confidence - b.confidence;
    }
    return sortDir === 'desc' 
      ? b.locationName.localeCompare(a.locationName)
      : a.locationName.localeCompare(b.locationName);
  });

  const handleSort = (field: 'confidence' | 'name') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-success" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />;
    }
  };

  const getMatchTypeBadge = (matchType: TestResult['matchType']) => {
    const colors = {
      exact: 'bg-success/20 text-success',
      area: 'bg-primary/20 text-primary',
      lga: 'bg-warning/20 text-warning',
      fuzzy: 'bg-chart-info/20 text-chart-info',
      none: 'bg-destructive/20 text-destructive',
    };

    return (
      <span className={`status-badge ${colors[matchType]}`}>
        {matchType.charAt(0).toUpperCase() + matchType.slice(1)}
      </span>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    let colorClass = 'bg-destructive/20 text-destructive';
    if (confidence >= 80) {
      colorClass = 'bg-success/20 text-success';
    } else if (confidence >= 50) {
      colorClass = 'bg-warning/20 text-warning';
    }

    return (
      <span className={`status-badge font-mono ${colorClass}`}>
        {confidence.toFixed(0)}%
      </span>
    );
  };

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th 
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Location
                    {sortField === 'name' && (
                      sortDir === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th>Google Address</th>
                <th>Google Postal</th>
                <th>Our Match</th>
                <th 
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('confidence')}
                >
                  <div className="flex items-center gap-1">
                    Confidence
                    {sortField === 'confidence' && (
                      sortDir === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th>Status</th>
                <th>Match Type</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => (
                <tr 
                  key={result.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => setSelectedResult(result)}
                >
                  <td className="font-mono text-muted-foreground">{index + 1}</td>
                  <td className="font-medium">{result.locationName}</td>
                  <td className="text-sm text-muted-foreground max-w-xs truncate">
                    {result.googleAddress || '--'}
                  </td>
                  <td className="font-mono">
                    {result.googlePostalCode || (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="font-mono font-medium text-primary">
                    {result.matchedPostalCode || (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td>{getConfidenceBadge(result.confidence)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="text-sm capitalize">{result.status}</span>
                    </div>
                  </td>
                  <td>{getMatchTypeBadge(result.matchType)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedResult?.locationName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Coordinates</div>
                  <div className="font-mono text-sm">
                    {selectedResult.latitude.toFixed(4)}, {selectedResult.longitude.toFixed(4)}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Confidence</div>
                  <div className="font-mono text-2xl font-bold">
                    {selectedResult.confidence.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase mb-1">Google Address</div>
                <div className="text-sm">{selectedResult.googleAddress || 'Not returned'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Google LGA</div>
                  <div className="text-sm">{selectedResult.googleLga || '--'}</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Google Area</div>
                  <div className="text-sm">{selectedResult.googleArea || '--'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Google Postal Code</div>
                  <div className="font-mono text-lg">{selectedResult.googlePostalCode || '--'}</div>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Our Matched Postal Code</div>
                  <div className="font-mono text-lg font-bold text-primary">
                    {selectedResult.matchedPostalCode || '--'}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Match Type</div>
                  {getMatchTypeBadge(selectedResult.matchType)}
                </div>
                <div className="flex-1 p-4 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedResult.status)}
                    <span className="capitalize">{selectedResult.status}</span>
                  </div>
                </div>
              </div>

              {selectedResult.failureReason && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="text-xs text-destructive uppercase mb-1">Failure Reason</div>
                  <div className="text-sm">{selectedResult.failureReason}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
