export function WalletIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Wallet body */}
      <rect x="8" y="30" width="104" height="72" rx="12" fill="#0a0a0a" />
      {/* Wallet flap */}
      <path
        d="M8 42C8 35.373 13.373 30 20 30H100C106.627 30 112 35.373 112 42V52H8V42Z"
        fill="#171717"
      />
      {/* Coin slot accent */}
      <rect x="72" y="60" width="32" height="26" rx="8" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
      {/* Coin circle */}
      <circle cx="88" cy="73" r="7" fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="1" />
      <circle cx="88" cy="73" r="3" fill="#444" />
      {/* Card lines */}
      <rect x="20" y="62" width="36" height="3" rx="1.5" fill="#2a2a2a" />
      <rect x="20" y="70" width="24" height="3" rx="1.5" fill="#222" />
      {/* Top notch */}
      <rect x="46" y="24" width="28" height="10" rx="5" fill="#0a0a0a" />
      <rect x="50" y="27" width="20" height="4" rx="2" fill="#1a1a1a" />
    </svg>
  );
}
