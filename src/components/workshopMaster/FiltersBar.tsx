import React from "react";

interface FiltersBarProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  statusOptions: string[];
}

export function FiltersBar({
  statusFilter,
  onStatusChange,
  search,
  onSearchChange,
  onRefresh,
  statusOptions,
}: FiltersBarProps) {
  return (
    <div className="wm-filters-bar">
      <div className="wm-filters-left">
        <select
          className="wm-input wm-input-sm"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <input
          className="wm-input wm-input-md"
          placeholder="Search by vehicle registration..."
          aria-label="Search bookings"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button className="wm-button-secondary" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}
