import React from "react";
import { motion } from "framer-motion";

const SnakeLoader = () => {
  const segments = Array.from({ length: 120 }, (_, i) => i); // much longer snake
  const radius = 250; // much bigger motion radius

  // Complex maze-like movement pattern
  const snakeVariants = {
    animate: (i) => ({
      x: Array.from({ length: 200 }, (_, j) =>
        Math.sin(j / 8 + i / 4) * radius +
        Math.cos(j / 3 + i / 10) * (radius / 2)
      ),
      y: Array.from({ length: 200 }, (_, j) =>
        Math.cos(j / 6 + i / 5) * radius +
        Math.sin(j / 4 + i / 8) * (radius / 2)
      ),
      transition: {
        duration: 20,
        repeat: Infinity,
        delay: i * 0.05,
        ease: "linear",
      },
    }),
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-tr from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,100,0.15)_0%,transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(0,255,100,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,100,0.2)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Border glow */}
      <div className="absolute inset-0 border border-green-400/30 rounded-3xl blur-md" />

      {/* Snake container — covers most of screen */}
      <div className="relative w-[10vw] h-[20vh]">
        {segments.map((segment) => (
          <motion.div
            key={segment}
            custom={segment}
            variants={snakeVariants}
            animate="animate"
            className="absolute"
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#00FF66",
              boxShadow: `
                0 0 12px #00FF66,
                0 0 24px #00FF66,
                0 0 40px #00FF66
              `,
              opacity: Math.max(0.1, 1 - segment * 0.006),
            }}
          />
        ))}
      </div>

      {/* Neon loading text */}
      <div className="absolute bottom-10 text-[#FF5F1F] font-mono text-lg tracking-widest opacity-80 drop-shadow-[0_0_10px_##FF5C00]">
        <span className="animate-pulse">LOADING RESUME...</span>
      </div>
    </div>
  );
};

export default SnakeLoader;
