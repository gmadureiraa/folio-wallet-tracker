"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TOKENS = [
  {
    symbol: "BTC",
    color: "#F7931A",
    logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  {
    symbol: "ETH",
    color: "#627EEA",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    symbol: "SOL",
    color: "#9945FF",
    logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  },
  {
    symbol: "USDC",
    color: "#2775CA",
    logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  },
  {
    symbol: "AVAX",
    color: "#E84142",
    logo: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  },
  {
    symbol: "MATIC",
    color: "#8247E5",
    logo: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  },
  {
    symbol: "ARB",
    color: "#12AAFF",
    logo: "https://assets.coingecko.com/coins/images/16547/small/arb.jpg",
  },
  {
    symbol: "OP",
    color: "#FF0420",
    logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  },
];

const EXPLODE_POSITIONS = [
  { x: -130, y: -110, rotate: -12 },
  { x: 100, y: -130, rotate: 8 },
  { x: -170, y: 15, rotate: -6 },
  { x: 155, y: -30, rotate: 14 },
  { x: -100, y: 100, rotate: -18 },
  { x: 135, y: 90, rotate: 10 },
  { x: -50, y: -145, rotate: -4 },
  { x: 55, y: 120, rotate: 12 },
];

export function WalletHero() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) setIsOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  function handleInteraction() {
    setHasInteracted(true);
    setIsOpen(!isOpen);
  }

  return (
    <div
      className="relative w-[340px] h-[300px] mx-auto cursor-pointer select-none"
      onClick={handleInteraction}
      onMouseEnter={() => {
        if (!hasInteracted) {
          setIsOpen(true);
          setHasInteracted(true);
        }
      }}
    >
      {/* Token cards — white bg, 1px gray-200 border, shadow-sm, 12px radius */}
      {TOKENS.map((token, i) => {
        const pos = EXPLODE_POSITIONS[i];
        return (
          <motion.div
            key={token.symbol}
            className="absolute left-1/2 top-1/2 -ml-7 -mt-7"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={
              isOpen
                ? {
                    x: pos.x,
                    y: pos.y,
                    scale: 1,
                    opacity: 1,
                    rotate: pos.rotate,
                  }
                : {
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0,
                    rotate: 0,
                  }
            }
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: isOpen ? i * 0.06 : (TOKENS.length - i) * 0.03,
            }}
          >
            <div
              className="w-14 h-14 rounded-[12px] flex items-center justify-center bg-white border border-[#E7E7E7]"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={token.logo}
                alt={token.symbol}
                className="w-7 h-7 rounded-full"
                loading="lazy"
              />
            </div>
          </motion.div>
        );
      })}

      {/* Wallet (center) — refined SVG with new palette */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        animate={isOpen ? { scale: 0.9, rotateY: 10 } : { scale: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ perspective: 800 }}
      >
        <svg
          width="140"
          height="120"
          viewBox="0 0 140 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow ellipse */}
          <ellipse cx="70" cy="112" rx="50" ry="6" fill="#111111" fillOpacity="0.04" />
          {/* Main body */}
          <rect x="15" y="25" width="110" height="75" rx="12" fill="#FFFFFF" />
          <rect x="15" y="25" width="110" height="75" rx="12" fill="url(#walletGradFolio)" />
          <rect x="15" y="25" width="110" height="75" rx="12" stroke="#E7E7E7" strokeWidth="1" />
          {/* Header section */}
          <path
            d="M15 37C15 30.373 20.373 25 27 25H113C119.627 25 125 30.373 125 37V50H15V37Z"
            fill="#F6F6F4"
          />
          <path d="M15 50H125" stroke="#E7E7E7" strokeWidth="0.5" />
          {/* Coin slot */}
          <rect
            x="95" y="55" width="30" height="22" rx="11"
            fill="#F6F6F4" stroke="#E7E7E7" strokeWidth="1"
          />
          <circle cx="110" cy="66" r="4" fill="#22C55E" fillOpacity="0.15" />
          <circle cx="110" cy="66" r="2" fill="#22C55E" fillOpacity="0.4" />
          {/* Card area */}
          <rect x="25" y="30" width="60" height="38" rx="4" fill="#111111" fillOpacity="0.02" />
          {/* Dashed line */}
          <path d="M20 80H120" stroke="#E7E7E7" strokeWidth="0.5" strokeDasharray="4 3" />
          {/* Brand text */}
          <text
            x="35" y="90"
            fill="#111111" fillOpacity="0.2"
            fontSize="10" fontFamily="monospace" fontWeight="600"
          >
            folio.
          </text>
          <defs>
            <linearGradient
              id="walletGradFolio" x1="15" y1="25" x2="125" y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#F6F6F4" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Hint text — gray-400 */}
      <motion.p
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-[#8A8A8A]"
        style={{ fontFamily: "var(--font-mono), monospace" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 0 : 0.6 }}
        transition={{ delay: 1.5 }}
      >
        clique para abrir
      </motion.p>
    </div>
  );
}
