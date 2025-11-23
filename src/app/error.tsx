"use client";

import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p>{error.message || "An unexpected error occurred. Please try again later."}</p>
      <button onClick={reset} style={{ marginTop: 16, padding: "8px 24px" }}>
        Try Again
      </button>
    </div>
  );
}
