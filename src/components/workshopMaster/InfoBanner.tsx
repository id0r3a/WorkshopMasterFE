import React from "react";

export function InfoBanner() {
  return (
    <section className="wm-info-banner">
      <h2 className="wm-info-title">How this page works</h2>
      <ol className="wm-info-steps">
        <li>
          <strong>Step 1:</strong> Filter bookings and click a row to preview details.
        </li>
        <li>
          <strong>Step 2:</strong> See full booking information in the right panel.
        </li>
        <li>
          <strong>Step 3:</strong> Create new bookings for customers & vehicles.
        </li>
      </ol>
    </section>
  );
}
