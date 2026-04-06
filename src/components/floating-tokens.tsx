"use client";

import { motion } from "framer-motion";

const tokens = [
  { symbol: "BTC", color: "#f7931a", bg: "#fff4e5", x: -340, y: -80, size: 58, delay: 0 },
  { symbol: "ETH", color: "#627eea", bg: "#eef1ff", x: 320, y: -100, size: 54, delay: 0.4 },
  { symbol: "SOL", color: "#9945ff", bg: "#f3ebff", x: -280, y: 140, size: 50, delay: 0.8 },
  { symbol: "AVAX", color: "#e84142", bg: "#ffeaea", x: 300, y: 130, size: 52, delay: 0.2 },
  { symbol: "BASE", color: "#0052ff", bg: "#e8f0ff", x: -140, y: -180, size: 46, delay: 1.0 },
  { symbol: "LINK", color: "#2a5ada", bg: "#e8eeff", x: 150, y: -175, size: 44, delay: 0.6 },
  { symbol: "ARB", color: "#28a0f0", bg: "#e5f4ff", x: -370, y: 30, size: 42, delay: 1.2 },
  { symbol: "ADA", color: "#0d1e6d", bg: "#e8ecff", x: 360, y: 20, size: 42, delay: 0.9 },
  { symbol: "DOT", color: "#e6007a", bg: "#ffedf5", x: -50, y: 200, size: 38, delay: 1.4 },
  { symbol: "MATIC", color: "#8247e5", bg: "#f0ebff", x: 60, y: 195, size: 38, delay: 1.1 },
];

function floatVariant(delay: number, index: number) {
  // Each token gets a unique float pattern
  const patterns = [
    { y: [0, -16, 2, -8, 0], x: [0, 6, -2, 4, 0], rotate: [0, 4, -2, 3, 0] },
    { y: [0, 10, -14, 4, 0], x: [0, -5, 3, -6, 0], rotate: [0, -3, 2, -4, 0] },
    { y: [0, -10, 8, -12, 0], x: [0, 8, -4, 2, 0], rotate: [0, 2, -3, 5, 0] },
    { y: [0, 14, -6, 10, 0], x: [0, -3, 7, -5, 0], rotate: [0, -4, 3, -2, 0] },
    { y: [0, -8, 12, -4, 0], x: [0, 5, -6, 3, 0], rotate: [0, 3, -4, 2, 0] },
  ];
  const p = patterns[index % patterns.length];

  return {
    animate: {
      y: p.y,
      x: p.x,
      rotate: p.rotate,
      transition: {
        duration: 7 + (index % 3),
        delay,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };
}

export function FloatingTokens() {
  return (
    <div className="relative w-full h-full">
      {tokens.map((token, index) => (
        <motion.div
          key={token.symbol}
          variants={floatVariant(token.delay, index)}
          animate="animate"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: token.delay * 0.5 }}
          className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-2xl font-bold text-xs select-none"
          style={{
            width: token.size,
            height: token.size,
            marginLeft: token.x,
            marginTop: token.y,
            background: token.bg,
            color: token.color,
            border: `1.5px solid ${token.color}22`,
            fontSize: token.size > 50 ? 11 : 10,
            boxShadow: `0 8px 32px ${token.color}15, 0 2px 8px ${token.color}10`,
          }}
        >
          {token.symbol}
        </motion.div>
      ))}
    </div>
  );
}
