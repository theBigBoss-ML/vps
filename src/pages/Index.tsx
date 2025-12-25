import { useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { MetricsCards } from '@/components/MetricsCards';
import { ViabilityVerdict } from '@/components/ViabilityVerdict';
import { ResultsTable } from '@/components/ResultsTable';
import { ResultsMap } from '@/components/ResultsMap';
import { FailureAnalysisPanel } from '@/components/FailureAnalysisPanel';
import { CoordinatesTable } from '@/components/CoordinatesTable';
import { PostalCodesTable } from '@/components/PostalCodesTable';
import { TestControls } from '@/components/TestControls';
import { ExportButtons } from '@/components/ExportButtons';
import { defaultTestCoordinates, TestCoordinate } from '@/data/testCoordinates';
import { defaultPostalCodes, PostalCode } from '@/data/postalCodes';
import { TestResult, TestProgress, TestMetrics } from '@/types/validation';
import { runValidationTest, calculateMetrics, analyzeFailures } from '@/lib/geocodingService';
import { MapPin, Database, FlaskConical, BarChart3 } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [coordinates, setCoordinates] = useState<TestCoordinate[]>(defaultTestCoordinates);
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>(defaultPostalCodes);
  const [results, setResults] = useState<TestResult[]>([]);
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [progress, setProgress] = useState<TestProgress>({ current: 0, total: 0, status: 'idle' });
  const stopRef = useRef(false);

  const handleStartTest = useCallback(async () => {
    if (!apiKey) return;
    
    stopRef.current = false;
    setResults([]);
    setMetrics(null);
    setProgress({ current: 0, total: coordinates.length, status: 'testing' });

    try {
      const testResults = await runValidationTest(
        coordinates,
        postalCodes,
        apiKey,
        (current, total, locationName) => {
          if (stopRef.current) throw new Error('stopped');
          setProgress({ current, total, status: 'testing', currentLocation: locationName });
        }
      );

      setResults(testResults);
      setMetrics(calculateMetrics(testResults));
      setProgress({ current: coordinates.length, total: coordinates.length, status: 'completed' });
    } catch (error) {
      if ((error as Error).message !== 'stopped') {
        console.error('Test error:', error);
      }
      setProgress(prev => ({ ...prev, status: 'idle' }));
    }
  }, [apiKey, coordinates, postalCodes]);

  const handleStopTest = () => {
    stopRef.current = true;
    setProgress(prev => ({ ...prev, status: 'idle' }));
  };

  const failures = results.length > 0 ? analyzeFailures(results) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Nigerian Postal Code Validator</h1>
                <p className="text-sm text-muted-foreground">GPS → Address → Postal Code Viability Test</p>
              </div>
            </div>
            <ExportButtons results={results} metrics={metrics} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* API Key & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApiKeyInput onApiKeySet={setApiKey} />
          <TestControls
            progress={progress}
            hasApiKey={!!apiKey}
            onStart={handleStartTest}
            onStop={handleStopTest}
            coordinateCount={coordinates.length}
          />
        </div>

        {/* Viability Verdict */}
        <ViabilityVerdict metrics={metrics} />

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} isLoading={progress.status === 'testing'} />

        {/* Tabs */}
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="results" className="gap-2 data-[state=active]:bg-card">
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2 data-[state=active]:bg-card">
              <MapPin className="h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="coordinates" className="gap-2 data-[state=active]:bg-card">
              <FlaskConical className="h-4 w-4" />
              Test Coordinates ({coordinates.length})
            </TabsTrigger>
            <TabsTrigger value="postalcodes" className="gap-2 data-[state=active]:bg-card">
              <Database className="h-4 w-4" />
              Postal Codes ({postalCodes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            {results.length > 0 ? (
              <>
                <ResultsTable results={results} />
                <FailureAnalysisPanel failures={failures} />
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">Run the validation test to see results here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <ResultsMap 
              results={results.length > 0 ? results : undefined} 
              coordinates={results.length === 0 ? coordinates : undefined}
            />
          </TabsContent>

          <TabsContent value="coordinates">
            <CoordinatesTable coordinates={coordinates} onUpdate={setCoordinates} />
          </TabsContent>

          <TabsContent value="postalcodes">
            <PostalCodesTable postalCodes={postalCodes} onUpdate={setPostalCodes} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Nigerian Postal Code Validation Testing App • Built to answer: "Can we reliably detect postal codes from GPS?"
        </div>
      </footer>
    </div>
  );
};

export default Index;
