export function GameLogo() {
  return (
    <svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.35" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.6" />
      <circle cx="24" cy="24" r="6"  fill="none" stroke="#c9a227" strokeWidth="1.5" />
      <line x1="24" y1="2"  x2="24" y2="16" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="32" x2="24" y2="46" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2"  y1="24" x2="16" y2="24" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="24" x2="46" y2="24" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2" fill="#c9a227" />
    </svg>
  );
}
