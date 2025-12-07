import React from "react";
import { StatusBadge } from "./StatusBadge";

interface Order {
  id: number;
  customerName: string;
  vehicleBrand: string;
  vehicleRegistrationNumber: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrderId: number | null;
  onRowClick: (order: Order) => void;
}

export function OrdersTable({
  orders,
  loading,
  error,
  selectedOrderId,
  onRowClick,
}: OrdersTableProps) {
  if (loading) return <div className="wm-text-muted">Loading bookings...</div>;
  if (error) return <div className="wm-text-error">{error}</div>;
  if (!orders.length) return <div className="wm-text-muted">No bookings found.</div>;

  const fdt = (v: string) => new Date(v).toLocaleString("sv-SE");

  return (
    <div className="wm-table-wrapper">
      <table className="wm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className={o.id === selectedOrderId ? "wm-row-selected" : ""}
              onClick={() => onRowClick(o)}
            >
              <td>{o.id}</td>
              <td>{o.customerName}</td>
              <td>
                {o.vehicleBrand} ({o.vehicleRegistrationNumber})
              </td>
              <td>
                <StatusBadge status={o.status} />
              </td>
              <td>{fdt(o.startTime)}</td>
              <td>{fdt(o.endTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
