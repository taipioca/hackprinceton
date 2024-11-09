"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  images: string[]; // Only images are required, memories are ignored
}

export default function MemoryBubbles({ images }: Props) {
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);
  const [bubbleStyles, setBubbleStyles] = useState<
    { top: number; left: number; size: number; hue: number }[]
  >([]);

  useEffect(() => {
    const styles = images.map(() => ({
      size: Math.random() * (120 - 80) + 80,
      top: Math.random() * 80,
      left: Math.random() * 80,
      hue: Math.random() * 360,
    }));
    setBubbleStyles(styles);
  }, [images]);

  return (
    <div className="relative w-[500px] h-[500px]">
      {images.map((img, idx) => {
        const { size, top, left, hue } = bubbleStyles[idx] || {};
        return (
          <motion.div
            key={`${img}-${idx}`}
            className="absolute rounded-full overflow-hidden cursor-pointer"
            style={{
              width: size,
              height: size,
              top: `${top}%`,
              left: `${left}%`,
              background: `linear-gradient(135deg, hsla(${hue}, 100%, 80%, 0.8), hsla(${hue}, 100%, 50%, 0.8))`,
              boxShadow: `0 0 20px hsla(${hue}, 100%, 50%, 0.5), inset 0 0 20px hsla(${hue}, 100%, 100%, 0.5)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            layout
            onClick={() => setSelectedMemory(idx)}
          >
            <img
              src={`data:image/jpeg;base64,${img}`} // Decode the base64 image string
              alt={`Memory ${idx}`}
              className="w-full h-full object-cover mix-blend-overlay"
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
              src={`data:image/jpeg;base64,${images[selectedMemory]}`} // Decode the selected image base64 string
              alt="Selected Memory"
              className="w-80 h-80 object-cover rounded-lg shadow-md mb-6"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
