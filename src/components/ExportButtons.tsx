import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestResult } from '@/types/validation';
import { TestMetrics } from '@/types/validation';
import Papa from 'papaparse';

interface ExportButtonsProps {
  results: TestResult[];
  metrics: TestMetrics | null;
}

export function ExportButtons({ results, metrics }: ExportButtonsProps) {
  const exportCSV = () => {
    const csvData = results.map(r => ({
      ID: r.coordinateId,
      'Location Name': r.locationName,
      Latitude: r.latitude,
      Longitude: r.longitude,
      'Google Address': r.googleAddress || '',
      'Google Postal Code': r.googlePostalCode || '',
      'Google LGA': r.googleLga || '',
      'Google Area': r.googleArea || '',
      'Matched Postal Code': r.matchedPostalCode || '',
      'Confidence %': r.confidence.toFixed(1),
      Status: r.status,
      'Match Type': r.matchType,
      'Failure Reason': r.failureReason || '',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postal-code-validation-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    if (!metrics) return;

    const reportContent = `
NIGERIAN POSTAL CODE VALIDATION TEST REPORT
=============================================
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
-----------------
Viability Status: ${metrics.viability.toUpperCase()}
Success Rate: ${metrics.successRate.toFixed(1)}%
Total Tested: ${metrics.total}

DETAILED METRICS
----------------
High Confidence (>80%): ${metrics.highConfidence}/${metrics.total}
Medium Confidence (50-79%): ${metrics.mediumConfidence}/${metrics.total}
Low/Failed (<50%): ${metrics.lowConfidence}/${metrics.total}
Google Returned Postal Code: ${metrics.googleReturnedPostalCode}/${metrics.total}

VIABILITY VERDICT
-----------------
${metrics.viability === 'viable' 
  ? '✅ YES - Proceed with confidence. The GPS → Address → Postal Code approach shows excellent accuracy.'
  : metrics.viability === 'conditional'
  ? '⚠️ CONDITIONAL - Needs improvements. Consider expanding the postal code database and improving area matching.'
  : '❌ NO - Consider alternatives. The current approach has too many failures.'}

RECOMMENDATIONS
---------------
${metrics.viability === 'viable' 
  ? '1. Proceed with production implementation\n2. Monitor accuracy over time\n3. Add user feedback loop for corrections'
  : metrics.viability === 'conditional'
  ? '1. Expand postal code database\n2. Improve fuzzy matching\n3. Add fallback to manual entry\n4. Consider partial deployment'
  : '1. Research official postal code APIs\n2. Partner with NIPOST\n3. Consider user self-selection\n4. Implement manual verification workflow'}

INDIVIDUAL RESULTS
------------------
${results.map((r, i) => 
  `${i + 1}. ${r.locationName}
   - Confidence: ${r.confidence.toFixed(0)}%
   - Status: ${r.status}
   - Matched: ${r.matchedPostalCode || 'None'}
   - Google Address: ${r.googleAddress || 'N/A'}
   ${r.failureReason ? `   - Failure: ${r.failureReason}` : ''}
`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postal-code-validation-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <Button 
        onClick={exportCSV} 
        disabled={results.length === 0}
        variant="secondary"
        className="gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export CSV
      </Button>
      <Button 
        onClick={exportReport} 
        disabled={results.length === 0 || !metrics}
        variant="secondary"
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Export Report
      </Button>
    </div>
  );
}
