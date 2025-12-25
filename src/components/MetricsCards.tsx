import { CheckCircle, AlertTriangle, XCircle, BarChart3, MapPin } from 'lucide-react';
import { TestMetrics } from '@/types/validation';

interface MetricsCardsProps {
  metrics: TestMetrics | null;
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="h-4 bg-muted/50 rounded w-20 mb-3" />
            <div className="h-8 bg-muted/50 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="High Confidence"
          value="--"
          sublabel=">80%"
          color="success"
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Medium Confidence"
          value="--"
          sublabel="50-79%"
          color="warning"
        />
        <MetricCard
          icon={<XCircle className="h-5 w-5" />}
          label="Low/Failed"
          value="--"
          sublabel="<50%"
          color="error"
        />
        <MetricCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Success Rate"
          value="--"
          sublabel="Overall"
          color="info"
        />
        <MetricCard
          icon={<MapPin className="h-5 w-5" />}
          label="Google Postal Codes"
          value="--"
          sublabel="API returned"
          color="info"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard
        icon={<CheckCircle className="h-5 w-5" />}
        label="High Confidence"
        value={`${metrics.highConfidence}/${metrics.total}`}
        sublabel=">80%"
        color="success"
      />
      <MetricCard
        icon={<AlertTriangle className="h-5 w-5" />}
        label="Medium Confidence"
        value={`${metrics.mediumConfidence}/${metrics.total}`}
        sublabel="50-79%"
        color="warning"
      />
      <MetricCard
        icon={<XCircle className="h-5 w-5" />}
        label="Low/Failed"
        value={`${metrics.lowConfidence}/${metrics.total}`}
        sublabel="<50%"
        color="error"
      />
      <MetricCard
        icon={<BarChart3 className="h-5 w-5" />}
        label="Success Rate"
        value={`${metrics.successRate.toFixed(1)}%`}
        sublabel="Overall"
        color="info"
      />
      <MetricCard
        icon={<MapPin className="h-5 w-5" />}
        label="Google Postal Codes"
        value={`${metrics.googleReturnedPostalCode}/${metrics.total}`}
        sublabel="API returned"
        color="info"
      />
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: 'success' | 'warning' | 'error' | 'info';
}

function MetricCard({ icon, label, value, sublabel, color }: MetricCardProps) {
  const colorClasses = {
    success: 'text-success glow-success',
    warning: 'text-warning glow-warning',
    error: 'text-destructive glow-error',
    info: 'text-chart-info',
  };

  const iconBgClasses = {
    success: 'bg-success/20',
    warning: 'bg-warning/20',
    error: 'bg-destructive/20',
    info: 'bg-chart-info/20',
  };

  return (
    <div className={`metric-card ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${iconBgClasses[color]}`}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-3xl font-bold font-mono">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>
    </div>
  );
}
