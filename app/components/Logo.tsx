// The Pantry mark: a rounded, stylized "P" on an eggplant tile, with a small herb leaf.
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Pantry" className="shrink-0">
      <rect width="48" height="48" rx="14" fill="#3b1a4a" />
      {/* The P: a soft stem and a round bowl */}
      <path
        d="M17 36V14.5c0-1.4 1.1-2.5 2.5-2.5h7.2c5.4 0 9.3 3.6 9.3 8.6s-3.9 8.6-9.3 8.6H22.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* A herb leaf tucked into the bowl */}
      <path d="M26.4 23.6c0-3.4 2.4-5.6 5.6-5.8-.1 3.3-2.3 5.7-5.6 5.8Z" fill="#7fd1a1" />
    </svg>
  );
}
