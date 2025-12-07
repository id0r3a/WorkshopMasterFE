import React from "react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`wm-badge wm-badge-${status}`}>{status}</span>;
}

export default StatusBadge;
