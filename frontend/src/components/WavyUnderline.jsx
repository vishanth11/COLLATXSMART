import React from 'react';

// Wraps its children with an animated hand-drawn-style wavy line beneath —
// used to mark the one phrase per section that should catch the eye first,
// echoing the Vestox reference's animated wavy underline treatment.
export default function WavyUnderline({ children, className = '' }) {
  return (
    <span className={`wavy-underline ${className}`}>
      {children}
      <svg viewBox="0 0 340 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 16 C 40 4, 70 22, 108 12 S 180 2, 218 14 S 290 22, 338 8" />
      </svg>
    </span>
  );
}
