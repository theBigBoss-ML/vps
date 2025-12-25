import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { TestMetrics } from '@/types/validation';

interface ViabilityVerdictProps {
  metrics: TestMetrics | null;
}

export function ViabilityVerdict({ metrics }: ViabilityVerdictProps) {
  if (!metrics) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-muted-foreground mb-2">
          IS THIS APPROACH VIABLE FOR PRODUCTION?
        </h2>
        <p className="text-muted-foreground">
          Run the validation test to see the viability verdict
        </p>
      </div>
    );
  }

  const verdictConfig = {
    viable: {
      icon: <CheckCircle className="h-16 w-16" />,
      title: '✅ YES - Proceed with confidence',
      description: 'The GPS → Address → Postal Code approach shows excellent accuracy. You can build this into production with high confidence.',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      glow: 'glow-success',
    },
    conditional: {
      icon: <AlertTriangle className="h-16 w-16" />,
      title: '⚠️ CONDITIONAL - Needs improvements',
      description: 'The approach works but has gaps. Consider expanding the postal code database and improving area matching before production.',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      glow: 'glow-warning',
    },
    'not-viable': {
      icon: <XCircle className="h-16 w-16" />,
      title: '❌ NO - Consider alternatives',
      description: 'The current approach has too many failures. Consider using official postal code APIs, expanding the database significantly, or implementing manual verification.',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      glow: 'glow-error',
    },
  };

  const config = verdictConfig[metrics.viability];

  return (
    <div className={`glass-card p-8 text-center border-2 ${config.borderColor} ${config.glow}`}>
      <div className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        THE CRITICAL ANSWER
      </div>
      <h2 className="text-xl font-bold text-foreground mb-6">
        IS THIS APPROACH VIABLE FOR PRODUCTION?
      </h2>
      
      <div className={`inline-flex items-center justify-center p-4 rounded-full ${config.bgColor} mb-6`}>
        <span className={config.color}>{config.icon}</span>
      </div>
      
      <h3 className={`text-3xl font-bold mb-4 ${config.color}`}>
        {config.title}
      </h3>
      
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
        {config.description}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="font-bold text-foreground">{metrics.successRate.toFixed(1)}%</div>
          <div className="text-muted-foreground">Success Rate</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="font-bold text-foreground">{metrics.highConfidence}</div>
          <div className="text-muted-foreground">High Conf.</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="font-bold text-foreground">{metrics.lowConfidence}</div>
          <div className="text-muted-foreground">Failed</div>
        </div>
      </div>
    </div>
  );
}
