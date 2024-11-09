"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  images: string[];
}

export default function MemoryBubbles({ images }: Props) {
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);
  const [bubbleStyles, setBubbleStyles] = useState<
    { top: number; left: number; size: number; hue: number; delay: number }[]
  >([]);

  useEffect(() => {
    const styles = images.map(() => ({
      size: Math.random() * (220 - 160) + 160, // Increase size range
      top: Math.random() * 60 + 5, // Increase range for top positioning
      left: Math.random() * 60 + 5, // Increase range for left positioning
      hue: Math.random() * 360,
      delay: Math.random() * 2,
    }));
    setBubbleStyles(styles);
  }, [images]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
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
              boxShadow: `0 0 30px hsla(${hue}, 100%, 20%, 0.3)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [0, Math.random() * 50 - 25, 0], // Increase random movement range
              y: [0, Math.random() * 50 - 25, 0], // Increase random movement range
              transition: {
                x: {
                  repeat: Infinity,
                  duration: 10 + Math.random() * 5,
                  ease: "easeInOut",
                  delay,
                },
                y: {
                  repeat: Infinity,
                  duration: 15 + Math.random() * 5,
                  ease: "easeInOut",
                  delay,
                },
              },
            }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            drag
            dragConstraints={{
              top: 0,
              left: 0,
              right: 600 - size,
              bottom: 600 - size,
            }}
            onClick={() => setSelectedMemory(idx)}
          >
            <img
              src={`data:image/jpeg;base64,${img}`}
              alt={`Memory ${idx}`}
              className="w-full h-full object-cover rounded-full"
              style={{
                boxShadow: `inset 0 0 30px rgba(255, 255, 255, 0.6)`, // Inner shadow for spherical effect
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)`, // Light overlay for bubble effect
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
              className="w-96 h-96 object-cover rounded-lg shadow-md mb-6"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
