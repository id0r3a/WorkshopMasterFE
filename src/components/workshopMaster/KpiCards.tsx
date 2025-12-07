import React from "react";

interface KpiCardsProps {
  summary: any;
  loading: boolean;
  error: string | null;
}

export function KpiCards({ summary, loading, error }: KpiCardsProps) {
  if (loading) return <div className="wm-text-muted">Loading dashboard...</div>;
  if (error) return <div className="wm-text-error">{error}</div>;
  if (!summary) return <div className="wm-text-muted">No dashboard data.</div>;

  return (
    <div className="wm-kpi-grid">
      <KpiCard label="Open orders" value={summary.openOrders} />
      <KpiCard label="Completed this week" value={summary.completedThisWeek} />
      <KpiCard
        label="Revenue last 30 days"
        value={summary.revenueLast30Days?.toLocaleString("sv-SE", {
          style: "currency",
          currency: "SEK",
        })}
      />
      <KpiCard label="Total customers" value={summary.totalCustomers} />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: any;
}

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div className="wm-card">
      <div className="wm-card-label">{label}</div>
      <div className="wm-card-value">{value}</div>
    </div>
  );
}
