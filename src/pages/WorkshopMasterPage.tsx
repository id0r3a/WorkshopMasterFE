import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import "../styles/WorkshopMasterPage.css";

import { STATUS_OPTIONS } from "../components/workshopMaster/statusOptions";
import { InfoBanner } from "../components/workshopMaster/InfoBanner";
import { KpiCards } from "../components/workshopMaster/KpiCards";
import { FiltersBar } from "../components/workshopMaster/FiltersBar";
import { OrdersTable } from "../components/workshopMaster/OrdersTable";
import { OrderDetailPanel } from "../components/workshopMaster/OrderDetailPanel";
import { CreateOrderPanel } from "../components/workshopMaster/CreateOrderPanel";

export default function WorkshopMasterPage() {
  // Dashboard
  const [summary, setSummary] = useState<any | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Orders list
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Selected order
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedOrderLoading, setSelectedOrderLoading] =
    useState<boolean>(false);
  const [selectedOrderError, setSelectedOrderError] = useState<string | null>(
    null
  );

  // Create panel
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  // Första laddning
  useEffect(() => {
    loadSummary();
    loadOrders();
  }, []);

  // Auto-filtrering när filter ändras
  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  async function loadSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await api.get("/Dashboard/booking-stats");
      setSummary(res.data);
    } catch {
      setSummaryError("Failed to load dashboard summary.");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.vehicleReg = search;

      const res = await api.get("/Bookings", { params });
      setOrders(res.data);
    } catch {
      setOrdersError("Failed to load service orders.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadOrderDetail(id: number | null) {
    if (!id) return;
    setSelectedOrderLoading(true);
    setSelectedOrderError(null);

    try {
      const res = await api.get(`/Bookings/${id}`);
      setSelectedOrder(res.data);
    } catch {
      setSelectedOrderError("Failed to load service order details.");
    } finally {
      setSelectedOrderLoading(false);
    }
  }

  function handleRowClick(order: any) {
    setSelectedOrderId(order.id);
    loadOrderDetail(order.id);
  }

  function handleRefresh() {
    loadSummary();
    loadOrders();
    if (selectedOrderId) {
      loadOrderDetail(selectedOrderId);
    }
  }

  function handleCreated() {
    setCreateOpen(false);
    handleRefresh();
  }

  function handleStatusUpdated() {
    handleRefresh();
  }

  return (
    <div className="wm-page">
      <div className="wm-container">
        <header className="wm-page-header">
          <div className="wm-page-brand">
            <div className="wm-logo">WM</div>
            <div>
              <h1 className="wm-page-title">Workshop Master</h1>
              <p className="wm-page-subtitle"></p>
            </div>
          </div>
          <button
            className="wm-button"
            onClick={() => setCreateOpen((x) => !x)}
          >
            {createOpen ? "Close form" : "New booking"}
          </button>
        </header>

        <InfoBanner />

        <section className="wm-kpi-section">
          <KpiCards
            summary={summary}
            loading={summaryLoading}
            error={summaryError}
          />
        </section>

        <section className="wm-filters-section">
          <FiltersBar
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            search={search}
            onSearchChange={setSearch}
            onRefresh={handleRefresh}
            statusOptions={ STATUS_OPTIONS }
          />
        </section>

        {createOpen && (
          <section className="wm-create-section">
            <CreateOrderPanel api={api} onCreated={handleCreated} />
          </section>
        )}

        <section className="wm-main-layout">
          <div className="wm-orders-column">
            <h2 className="wm-section-title">Step 1 – Booking list</h2>
            <p className="wm-section-help">
              Filter bookings above. Click a row to preview details.
            </p>

            <OrdersTable
              orders={orders}
              loading={ordersLoading}
              error={ordersError}
              selectedOrderId={selectedOrderId}
              onRowClick={handleRowClick}
            />
          </div>

          <div className="wm-detail-column">
            <OrderDetailPanel
              order={selectedOrder}
              loading={selectedOrderLoading}
              error={selectedOrderError}
              onStatusUpdated={handleStatusUpdated}
              statusOptions={STATUS_OPTIONS}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
