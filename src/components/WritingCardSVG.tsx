import React from "react";

const WritingCardSVG: React.FC<{ width?: number; height?: number }> = ({ width = 120, height = 80 }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{ display: "block" }}
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="4"
      y="4"
      width={width - 8}
      height={height - 8}
      rx="16"
      fill="var(--card-bg, #fff)"
      stroke="var(--card-border, #ddd)"
      strokeWidth="2"
      filter="drop-shadow(0 2px 8px rgba(0,0,0,0.08))"
    />
  </svg>
);

export default WritingCardSVG;

