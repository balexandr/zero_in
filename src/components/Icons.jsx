// Small line-art icon set replacing emoji in Zero In's UI. Matches the
// 24x24 viewBox / stroke / currentColor style the rest of the suite
// uses. Share text is NOT touched by this: generateShareText() in
// useGameState.js builds the actual shared result string (guess count
// + 🟩🟥⬜ squares), plain text sent via SMS/clipboard, a custom icon
// can't survive that trip, so it stays real Unicode there.
function base(props) {
  return { viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true, ...props };
}

export function IconClose({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheckmark({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconXSmall({ size = 13, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconDash({ size = 13, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconShare({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} {...base(props)}>
      <path d="M12 15V4M12 4l-3.5 3.5M12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A result square, replacing the 🟩🟥⬜ emoji grid with real theme-color
// fills instead of whatever color an OS's emoji font happens to render.
export function IconResultSquare({ state, size = 16, ...props }) {
  const colors = {
    correct: '#22c55e',
    wrong: '#ef4444',
    unused: 'rgba(255,255,255,0.12)',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="14" height="14" rx="3" fill={colors[state] || colors.unused} />
    </svg>
  );
}
