import React, { useEffect, useState } from "react";
import axios from "axios";

interface CreateOrderPanelProps {
  api: any;
  onCreated: () => void;
}

export function CreateOrderPanel({ api, onCreated }: CreateOrderPanelProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    description: "",
    serviceTypeIds: [] as number[],
    date: "",
    startTime: "",
    durationHours: "2",
    newCustomerName: "",
    newCustomerPhone: "",
    newCustomerEmail: "",
    newVehicleRegNumber: "",
    newVehicleBrand: "",
    newVehicleModel: "",
    newVehicleYear: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showExistingVehicleForm, setShowExistingVehicleForm] = useState(false);
  const [existingVehicleForm, setExistingVehicleForm] = useState({
    registrationNumber: "",
    brand: "",
    model: "",
    year: "",
  });
  const [creatingVehicle, setCreatingVehicle] = useState(false);

  useEffect(() => {
    loadLookups();
  }, []);

  async function loadLookups() {
    try {
      const [c, s] = await Promise.all([
        api.get("/Customers"),
        api.get("/ServiceTypes"),
      ]);
      setCustomers(c.data || []);
      setServiceTypes(s.data || []);
    } catch {
      setLookupsError("Failed to load data.");
    } finally {
      setLookupsLoading(false);
    }
  }

  useEffect(() => {
    if (mode !== "existing") return;
    if (!form.customerId) {
      setVehicles([]);
      return;
    }

    async function loadVehicles() {
      try {
        const res = await api.get(`/Vehicles/by-customer/${form.customerId}`);
        setVehicles(res.data || []);
      } catch {
        setErrors((e: any) => ({ ...e, vehicle: "Failed to load vehicles." }));
      }
    }

    loadVehicles();
  }, [form.customerId, mode]);

  function updateForm(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function updateExistingVehicleForm(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setExistingVehicleForm((v) => ({ ...v, [name]: value }));
  }

  function toggleServiceType(id: number) {
    setForm((f) => ({
      ...f,
      serviceTypeIds: f.serviceTypeIds.includes(id)
        ? f.serviceTypeIds.filter((x) => x !== id)
        : [...f.serviceTypeIds, id],
    }));
  }

  function validate() {
    const e: any = {};

    if (!form.serviceTypeIds.length) {
      e.serviceTypeIds = "Select at least one service type.";
    }

    if (!form.date) e.date = "Booking date is required.";
    if (!form.startTime) e.startTime = "Start time is required.";
    if (!form.durationHours || Number(form.durationHours) <= 0) {
      e.durationHours = "Duration must be greater than 0.";
    }

    if (mode === "existing") {
      if (!form.customerId) e.customerId = "Customer is required.";
      if (!form.vehicleId) e.vehicleId = "Vehicle is required.";
    } else {
      if (!form.newCustomerName) e.newCustomerName = "Name is required.";
      if (!form.newCustomerPhone) e.newCustomerPhone = "Phone is required.";
      if (!form.newCustomerEmail) e.newCustomerEmail = "Email is required.";

      if (!form.newVehicleRegNumber)
        e.newVehicleRegNumber = "Registration number is required.";
      if (!form.newVehicleBrand) e.newVehicleBrand = "Brand is required.";
      if (!form.newVehicleModel) e.newVehicleModel = "Model is required.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreateVehicleForExisting(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();

    if (!form.customerId) {
      setErrors((prev: any) => ({
        ...prev,
        customerId: "Select a customer first.",
      }));
      return;
    }

    const ve: any = {};
    if (!existingVehicleForm.registrationNumber)
      ve.existingReg = "Registration number is required.";
    if (!existingVehicleForm.brand) ve.existingBrand = "Brand is required.";
    if (!existingVehicleForm.model) ve.existingModel = "Model is required.";

    if (Object.keys(ve).length > 0) {
      setErrors((prev: any) => ({ ...prev, ...ve }));
      return;
    }

    setCreatingVehicle(true);
    try {
      const res = await api.post("/Vehicles", {
        registrationNumber: existingVehicleForm.registrationNumber,
        brand: existingVehicleForm.brand,
        model: existingVehicleForm.model,
        year: existingVehicleForm.year
          ? Number(existingVehicleForm.year)
          : new Date().getFullYear(),
        customerId: Number(form.customerId),
      });

      const created = res.data;

      setVehicles((prev) => [...prev, created]);
      setForm((f) => ({ ...f, vehicleId: created.id.toString() }));

      setExistingVehicleForm({
        registrationNumber: "",
        brand: "",
        model: "",
        year: "",
      });
      setShowExistingVehicleForm(false);
      setErrors((prev: any) => ({
        ...prev,
        existingReg: undefined,
        existingBrand: undefined,
        existingModel: undefined,
        vehicle: undefined,
      }));
    } catch {
      setErrors((prev: any) => ({
        ...prev,
        vehicle: "Failed to create vehicle.",
      }));
    } finally {
      setCreatingVehicle(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setErrors((prev: any) => ({ ...prev, submit: null }));

    try {
      let vehicleId: number;

      if (mode === "existing") {
        vehicleId = Number(form.vehicleId);
      } else {
        const customerRes = await api.post("/Customers", {
          fullName: form.newCustomerName,
          phoneNumber: form.newCustomerPhone,
          email: form.newCustomerEmail,
        });
        const customerId = customerRes.data.id;

        const vehicleRes = await api.post("/Vehicles", {
          registrationNumber: form.newVehicleRegNumber,
          brand: form.newVehicleBrand,
          model: form.newVehicleModel,
          year: form.newVehicleYear
            ? Number(form.newVehicleYear)
            : new Date().getFullYear(),
          customerId,
        });
        vehicleId = vehicleRes.data.id;
      }

      const localStart = new Date(`${form.date}T${form.startTime}`);
      const duration = Number(form.durationHours) || 1;
      const localEnd = new Date(
        localStart.getTime() + duration * 60 * 60 * 1000
      );

      const startUtc = new Date(
        localStart.getTime() - localStart.getTimezoneOffset() * 60000
      );
      const endUtc = new Date(
        localEnd.getTime() - localEnd.getTimezoneOffset() * 60000
      );

      await api.post("/Bookings", {
        vehicleId,
        startTime: startUtc.toISOString(),
        endTime: endUtc.toISOString(),
        serviceTypeIds: form.serviceTypeIds,
        notes: form.description || null,
      });

      onCreated();
    } catch (err: any) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const backendMessage =
          (err.response?.data as any)?.message || "Failed to save booking.";

        if (status === 409) {
          setErrors((prev: any) => ({
            ...prev,
            newCustomerEmail: backendMessage,
            submit: backendMessage,
          }));
        } else {
          setErrors((prev: any) => ({
            ...prev,
            submit: backendMessage,
          }));
        }
      } else {
        setErrors((prev: any) => ({
          ...prev,
          submit: "Failed to save booking.",
        }));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wm-card wm-create-card">
      <h2 className="wm-detail-title">Step 3 – Create new booking</h2>
      <p className="wm-section-help">
        You can create a booking for an existing customer or register a new one.
      </p>

      {lookupsLoading && <p className="wm-text-muted">Loading form...</p>}
      {lookupsError && <p className="wm-text-error">{lookupsError}</p>}

      {/* Mode toggle */}
      <div className="wm-mode-toggle">
        <button
          type="button"
          className={
            mode === "existing"
              ? "wm-toggle-button wm-toggle-button-active"
              : "wm-toggle-button"
          }
          onClick={() => setMode("existing")}
        >
          Existing customer
        </button>
        <button
          type="button"
          className={
            mode === "new"
              ? "wm-toggle-button wm-toggle-button-active"
              : "wm-toggle-button"
          }
          onClick={() => setMode("new")}
        >
          New customer
        </button>
      </div>

      <form className="wm-form" onSubmit={handleSubmit}>
        {mode === "existing" ? (
          <>
            {/* EXISTING CUSTOMER MODE */}
            <div className="wm-form-row-inline">
              <div className="wm-form-field">
                <label>Customer *</label>
                <select
                  name="customerId"
                  className="wm-input"
                  value={form.customerId}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      customerId: e.target.value,
                      vehicleId: "",
                    }));
                    setShowExistingVehicleForm(false);
                    setExistingVehicleForm({
                      registrationNumber: "",
                      brand: "",
                      model: "",
                      year: "",
                    });
                  }}
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <div className="wm-text-error">{errors.customerId}</div>
                )}
              </div>

              <div className="wm-form-field">
                <label>Vehicle *</label>
                <select
                  name="vehicleId"
                  className="wm-input"
                  disabled={!form.customerId}
                  value={form.vehicleId}
                  onChange={updateForm}
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <div className="wm-text-error">{errors.vehicleId}</div>
                )}
                {errors.vehicle && (
                  <div className="wm-text-error">{errors.vehicle}</div>
                )}
                {form.customerId && !vehicles.length && !errors.vehicle && (
                  <div className="wm-text-muted">
                    No vehicles found for this customer.
                  </div>
                )}

                {form.customerId && (
                  <button
                    type="button"
                    className="wm-link-button"
                    onClick={() => setShowExistingVehicleForm((x) => !x)}
                  >
                    {showExistingVehicleForm
                      ? "Cancel new vehicle"
                      : "Add new vehicle for this customer"}
                  </button>
                )}
              </div>
            </div>

            {showExistingVehicleForm && (
              <div className="wm-new-vehicle-panel">
                <h3 className="wm-detail-heading">
                  New vehicle for this customer
                </h3>
                <div className="wm-form-row-inline">
                  <div className="wm-form-field">
                    <label>Registration number *</label>
                    <input
                      name="registrationNumber"
                      className="wm-input"
                      value={existingVehicleForm.registrationNumber}
                      onChange={updateExistingVehicleForm}
                    />
                    {errors.existingReg && (
                      <div className="wm-text-error">
                        {errors.existingReg}
                      </div>
                    )}
                  </div>
                  <div className="wm-form-field">
                    <label>Brand *</label>
                    <input
                      name="brand"
                      className="wm-input"
                      value={existingVehicleForm.brand}
                      onChange={updateExistingVehicleForm}
                    />
                    {errors.existingBrand && (
                      <div className="wm-text-error">
                        {errors.existingBrand}
                      </div>
                    )}
                  </div>
                  <div className="wm-form-field">
                    <label>Model *</label>
                    <input
                      name="model"
                      className="wm-input"
                      value={existingVehicleForm.model}
                      onChange={updateExistingVehicleForm}
                    />
                    {errors.existingModel && (
                      <div className="wm-text-error">
                        {errors.existingModel}
                      </div>
                    )}
                  </div>
                </div>
                <div className="wm-form-field">
                  <label>Year</label>
                  <input
                    name="year"
                    type="number"
                    className="wm-input"
                    value={existingVehicleForm.year}
                    onChange={updateExistingVehicleForm}
                  />
                </div>

                <div className="wm-form-actions">
                  <button
                    type="button"
                    className="wm-button-secondary"
                    onClick={handleCreateVehicleForExisting}
                    disabled={creatingVehicle}
                  >
                    {creatingVehicle ? "Saving vehicle..." : "Save vehicle"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* NEW CUSTOMER MODE */}
            <h3 className="wm-detail-heading">New customer</h3>
            <div className="wm-form-row-inline">
              <div className="wm-form-field">
                <label>Name *</label>
                <input
                  name="newCustomerName"
                  className="wm-input"
                  value={form.newCustomerName}
                  onChange={updateForm}
                />
                {errors.newCustomerName && (
                  <div className="wm-text-error">{errors.newCustomerName}</div>
                )}
              </div>
              <div className="wm-form-field">
                <label>Phone *</label>
                <input
                  name="newCustomerPhone"
                  className="wm-input"
                  value={form.newCustomerPhone}
                  onChange={updateForm}
                />
                {errors.newCustomerPhone && (
                  <div className="wm-text-error">{errors.newCustomerPhone}</div>
                )}
              </div>
              <div className="wm-form-field">
                <label>Email *</label>
                <input
                  name="newCustomerEmail"
                  className="wm-input"
                  value={form.newCustomerEmail}
                  onChange={updateForm}
                />
                {errors.newCustomerEmail && (
                  <div className="wm-text-error">{errors.newCustomerEmail}</div>
                )}
              </div>
            </div>

            <h3 className="wm-detail-heading">New vehicle</h3>
            <div className="wm-form-row-inline">
              <div className="wm-form-field">
                <label>Registration number *</label>
                <input
                  name="newVehicleRegNumber"
                  className="wm-input"
                  value={form.newVehicleRegNumber}
                  onChange={updateForm}
                />
                {errors.newVehicleRegNumber && (
                  <div className="wm-text-error">
                    {errors.newVehicleRegNumber}
                  </div>
                )}
              </div>
              <div className="wm-form-field">
                <label>Brand *</label>
                <input
                  name="newVehicleBrand"
                  className="wm-input"
                  value={form.newVehicleBrand}
                  onChange={updateForm}
                />
                {errors.newVehicleBrand && (
                  <div className="wm-text-error">{errors.newVehicleBrand}</div>
                )}
              </div>
              <div className="wm-form-field">
                <label>Model *</label>
                <input
                  name="newVehicleModel"
                  className="wm-input"
                  value={form.newVehicleModel}
                  onChange={updateForm}
                />
                {errors.newVehicleModel && (
                  <div className="wm-text-error">{errors.newVehicleModel}</div>
                )}
              </div>
            </div>

            <div className="wm-form-field">
              <label>Year</label>
              <input
                name="newVehicleYear"
                className="wm-input"
                type="number"
                value={form.newVehicleYear}
                onChange={updateForm}
              />
            </div>
          </>
        )}

        {/* BOOKING TIME (GEMENSAM) */}
        <h3 className="wm-detail-heading">Booking time</h3>
        <div className="wm-form-row-inline">
          <div className="wm-form-field">
            <label>Booking date *</label>
            <input
              type="date"
              name="date"
              className="wm-input"
              value={form.date}
              onChange={updateForm}
            />
            {errors.date && <div className="wm-text-error">{errors.date}</div>}
          </div>

          <div className="wm-form-field">
            <label>Start time *</label>
            <input
              type="time"
              name="startTime"
              className="wm-input"
              value={form.startTime}
              onChange={updateForm}
            />
            {errors.startTime && (
              <div className="wm-text-error">{errors.startTime}</div>
            )}
          </div>

          <div className="wm-form-field">
            <label>Duration (hours) *</label>
            <input
              type="number"
              min="1"
              max="12"
              name="durationHours"
              className="wm-input"
              value={form.durationHours}
              onChange={updateForm}
            />
            {errors.durationHours && (
              <div className="wm-text-error">{errors.durationHours}</div>
            )}
          </div>
        </div>

        <div className="wm-form-field">
          <label>Description / notes</label>
          <textarea
            name="description"
            rows={3}
            className="wm-input"
            value={form.description}
            onChange={updateForm}
            placeholder="Short description..."
          />
        </div>

        <div className="wm-form-field">
          <label>Service types *</label>
          <div className="wm-chip-row">
            {serviceTypes.map((s) => (
              <button
                type="button"
                key={s.id}
                className={
                  form.serviceTypeIds.includes(s.id)
                    ? "wm-chip wm-chip-active"
                    : "wm-chip"
                }
                onClick={() => toggleServiceType(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
          {errors.serviceTypeIds && (
            <div className="wm-text-error">{errors.serviceTypeIds}</div>
          )}
        </div>

        {errors.submit && <div className="wm-text-error">{errors.submit}</div>}

        <div className="wm-form-actions">
          <button className="wm-button" disabled={saving}>
            {saving ? "Saving..." : "Save booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
