import { MapPin, Database, XCircle, BarChart3, Target } from 'lucide-react';
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
          icon={<MapPin className="h-5 w-5" />}
          label="Google Postal Code"
          value="--"
          sublabel="Primary source"
          color="success"
          isPrimary
        />
        <MetricCard
          icon={<Database className="h-5 w-5" />}
          label="Database Fallback"
          value="--"
          sublabel="Secondary source"
          color="warning"
        />
        <MetricCard
          icon={<XCircle className="h-5 w-5" />}
          label="Failed"
          value="--"
          sublabel="No postal code"
          color="error"
        />
        <MetricCard
          icon={<Target className="h-5 w-5" />}
          label="Google Rate"
          value="--"
          sublabel="Key metric"
          color="info"
          isPrimary
        />
        <MetricCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Total Success"
          value="--"
          sublabel="Google + Fallback"
          color="info"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard
        icon={<MapPin className="h-5 w-5" />}
        label="Google Postal Code"
        value={`${metrics.googleReturned}/${metrics.total}`}
        sublabel="Primary source"
        color="success"
        isPrimary
      />
      <MetricCard
        icon={<Database className="h-5 w-5" />}
        label="Database Fallback"
        value={`${metrics.databaseFallback}/${metrics.total}`}
        sublabel="Secondary source"
        color="warning"
      />
      <MetricCard
        icon={<XCircle className="h-5 w-5" />}
        label="Failed"
        value={`${metrics.failed}/${metrics.total}`}
        sublabel="No postal code"
        color="error"
      />
      <MetricCard
        icon={<Target className="h-5 w-5" />}
        label="Google Rate"
        value={`${metrics.googleRate.toFixed(1)}%`}
        sublabel="Key metric"
        color="info"
        isPrimary
      />
      <MetricCard
        icon={<BarChart3 className="h-5 w-5" />}
        label="Total Success"
        value={`${metrics.totalSuccessRate.toFixed(1)}%`}
        sublabel="Google + Fallback"
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
  isPrimary?: boolean;
}

function MetricCard({ icon, label, value, sublabel, color, isPrimary }: MetricCardProps) {
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
    <div className={`metric-card ${colorClasses[color]} ${isPrimary ? 'ring-2 ring-primary/50' : ''}`}>
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
