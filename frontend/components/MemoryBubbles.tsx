"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  images: string[];
}

export default function MemoryBubbles({ images }: Props) {
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);

  // Hardcoded positions and sizes for the bubbles
  const bubbleStyles = [
    { top: 10, left: 10, size: 70, hue: 100, delay: 0 },
    { top: 30, left: 50, size: 95, hue: 100, delay: 0.5 },
    { top: 50, left: 80, size: 80, hue: 100, delay: 1 },
    { top: 70, left: 20, size: 60, hue: 100, delay: 1.5 },
    { top: 40, left: 70, size: 90, hue: 100, delay: 2 },
    { top: 20, left: 50, size: 75, hue: 100, delay: 2 },
  ];

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {images.map((img, idx) => {
        const { size, top, left, hue, delay } = bubbleStyles[idx] || {};
        return (
          <motion.div
            key={`${img}-${idx}`}
            className="absolute rounded-full overflow-hidden cursor-pointer"
            style={{
              width: size,
              height: size,
              top: `${top}%`,
              left: `${left}%`,
              boxShadow: `0 0 20px hsla(${hue}, 100%, 20%, 0.3)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
              transition: {
                x: { repeat: Infinity, duration: 10 + Math.random() * 5, ease: "easeInOut", delay },
                y: { repeat: Infinity, duration: 15 + Math.random() * 5, ease: "easeInOut", delay },
              },
            }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            drag
            dragConstraints={{ top: 0, left: 0, right: 400 - size, bottom: 400 - size }}
            onClick={() => setSelectedMemory(idx)}
          >
            <img
              src={`data:image/jpeg;base64,${img}`}
              alt={`Memory ${idx}`}
              className="w-full h-full object-cover rounded-full"
              style={{
                boxShadow: `inset 0 0 20px rgba(255, 255, 255, 0.6)`,
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)`,
                mixBlendMode: "overlay",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)`,
              }}
            />
          </motion.div>
        );
      })}
      <AnimatePresence>
        {selectedMemory !== null && (
          <motion.div
            className="absolute inset-0 bg-white/90 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={`data:image/jpeg;base64,${images[selectedMemory]}`}
              alt="Selected Memory"
              className="w-80 h-80 object-cover rounded-lg shadow-md mb-6"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
