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
      'Final Postal Code': r.finalPostalCode || '',
      Source: r.postalCodeSource,
      Status: r.status,
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
Google Postal Code Rate: ${metrics.googleRate.toFixed(1)}%
Total Success Rate: ${metrics.totalSuccessRate.toFixed(1)}%
Total Tested: ${metrics.total}

DETAILED METRICS
----------------
Google Returned Postal Code: ${metrics.googleReturned}/${metrics.total} (PRIMARY)
Database Fallback Matches: ${metrics.databaseFallback}/${metrics.total} (SECONDARY)
Failed (No Postal Code): ${metrics.failed}/${metrics.total}

VIABILITY VERDICT
-----------------
${metrics.viability === 'viable' 
  ? '✅ VIABLE - Google Maps returns postal codes for >85% of locations. This approach is production-ready.'
  : metrics.viability === 'conditional'
  ? '⚠️ CONDITIONAL - Google returns postal codes for 75-85% of locations. Database fallback covers remaining cases.'
  : '❌ NOT VIABLE - Google returns postal codes for <75% of locations. Consider alternatives.'}

RECOMMENDATIONS
---------------
${metrics.viability === 'viable' 
  ? '1. Proceed with production implementation using Google postal codes\n2. Keep database fallback for edge cases\n3. Monitor accuracy over time'
  : metrics.viability === 'conditional'
  ? '1. Use Google postal codes as primary source\n2. Expand database fallback for uncovered areas\n3. Consider manual entry for remaining failures'
  : '1. Research alternative postal code APIs\n2. Consider NIPOST partnership\n3. Implement manual verification workflow\n4. Expand database significantly'}

INDIVIDUAL RESULTS
------------------
${results.map((r, i) => 
  `${i + 1}. ${r.locationName}
   - Status: ${r.status.toUpperCase()}
   - Final Postal Code: ${r.finalPostalCode || 'None'}
   - Source: ${r.postalCodeSource}
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
