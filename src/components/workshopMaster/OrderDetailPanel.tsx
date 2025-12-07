import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { StatusBadge } from "./StatusBadge";

interface OrderDetailPanelProps {
  order: any;
  loading: boolean;
  error: string | null;
  onStatusUpdated?: () => void;
  statusOptions: string[];
}

export function OrderDetailPanel({
  order,
  loading,
  error,
  onStatusUpdated,
  statusOptions,
}: OrderDetailPanelProps) {
  const [statusValue, setStatusValue] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setStatusValue(order.status || "");
      setStatusError(null);
    }
  }, [order]);

  if (loading) return <div className="wm-text-muted">Loading booking...</div>;
  if (error) return <div className="wm-text-error">{error}</div>;
  if (!order)
    return (
      <div className="wm-empty-panel">
        <p className="wm-text-muted">Select a booking from the list.</p>
      </div>
    );

  const fdt = (v: string) => new Date(v).toLocaleString("sv-SE");
  const vehicleLabel = `${order.vehicleBrand} (${order.vehicleRegistrationNumber})`;

  async function handleSaveStatus() {
    if (!statusValue) return;
    setSavingStatus(true);
    setStatusError(null);

    try {
      await api.patch(`/Bookings/${order.id}/status`, { status: statusValue });
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err) {
      console.error(err);
      setStatusError("Failed to update status.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="wm-detail-card">
      <h2 className="wm-detail-title">Step 2 – Booking details</h2>
      <p className="wm-section-help">Information about the selected booking.</p>

      <section className="wm-detail-section">
        <h3 className="wm-detail-heading">Status</h3>
        <div className="wm-status-row">
          <select
            className="wm-input wm-input-sm"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="wm-button-secondary"
            onClick={handleSaveStatus}
            disabled={savingStatus}
          >
            {savingStatus ? "Saving..." : "Update status"}
          </button>
        </div>
        {statusError && <div className="wm-text-error">{statusError}</div>}
      </section>

      <section className="wm-detail-section">
        <h3 className="wm-detail-heading">Overview</h3>
        <p>
          <strong>Status:</strong> <StatusBadge status={order.status} />
        </p>
        <p>
          <strong>Customer:</strong> {order.customerName}
        </p>
        <p>
          <strong>Vehicle:</strong> {vehicleLabel}</p>
        <p>
          <strong>Start time:</strong> {fdt(order.startTime)}
        </p>
        <p>
          <strong>End time:</strong> {fdt(order.endTime)}
        </p>
        <p>
          <strong>Notes:</strong> {order.notes || "-"}
        </p>
      </section>

      <section className="wm-detail-section">
        <h3 className="wm-detail-heading">Service types</h3>
        {order.serviceTypes && order.serviceTypes.length ? (
          <ul className="wm-detail-list">
            {order.serviceTypes.map((name: string, idx: number) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="wm-text-muted">No service types.</p>
        )}
      </section>
    </div>
  );
}
