import { useState } from 'react';
import { TestResult } from '@/types/validation';
import { ChevronDown, ChevronUp, Check, Database, X, MapPin } from 'lucide-react';
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
  const [sortField, setSortField] = useState<'source' | 'name'>('source');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  const sortedResults = [...results].sort((a, b) => {
    if (sortField === 'source') {
      const order = { google: 3, database: 2, none: 1 };
      const aVal = order[a.postalCodeSource];
      const bVal = order[b.postalCodeSource];
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    }
    return sortDir === 'desc' 
      ? b.locationName.localeCompare(a.locationName)
      : a.locationName.localeCompare(b.locationName);
  });

  const handleSort = (field: 'source' | 'name') => {
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
      case 'fallback':
        return <Database className="h-4 w-4 text-warning" />;
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />;
    }
  };

  const getSourceBadge = (source: TestResult['postalCodeSource']) => {
    const colors = {
      google: 'bg-success/20 text-success',
      database: 'bg-warning/20 text-warning',
      none: 'bg-destructive/20 text-destructive',
    };
    const labels = {
      google: 'Google',
      database: 'Fallback',
      none: 'None',
    };

    return (
      <span className={`status-badge ${colors[source]}`}>
        {labels[source]}
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
                <th>Final Postal Code</th>
                <th 
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('source')}
                >
                  <div className="flex items-center gap-1">
                    Source
                    {sortField === 'source' && (
                      sortDir === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th>Status</th>
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
                  <td className="font-mono font-medium text-primary text-lg">
                    {result.finalPostalCode || (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td>{getSourceBadge(result.postalCodeSource)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="text-sm capitalize">{result.status}</span>
                    </div>
                  </td>
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
                  <div className="text-xs text-muted-foreground uppercase mb-1">Source</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedResult.status)}
                    {getSourceBadge(selectedResult.postalCodeSource)}
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
                <div className={`p-4 rounded-lg border ${selectedResult.postalCodeSource === 'google' ? 'bg-success/10 border-success/30' : 'bg-muted/30 border-muted/30'}`}>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Google Postal Code</div>
                  <div className={`font-mono text-lg ${selectedResult.googlePostalCode ? 'font-bold text-success' : ''}`}>
                    {selectedResult.googlePostalCode || '--'}
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${selectedResult.postalCodeSource === 'database' ? 'bg-warning/10 border-warning/30' : 'bg-muted/30 border-muted/30'}`}>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Database Fallback</div>
                  <div className={`font-mono text-lg ${selectedResult.fallbackPostalCode ? 'font-bold text-warning' : ''}`}>
                    {selectedResult.fallbackPostalCode || '--'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                <div className="text-xs text-muted-foreground uppercase mb-1">Final Postal Code</div>
                <div className="font-mono text-2xl font-bold text-primary">
                  {selectedResult.finalPostalCode || 'Not Found'}
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
