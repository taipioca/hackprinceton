import React, { useState } from "react";

interface Props {
  memories: string[];
  images: string[];
}

const MemoryBubbles: React.FC<Props> = ({ memories, images }) => {
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);

  return (
    <div className="relative flex flex-wrap gap-4">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          onClick={() => setSelectedMemory(idx)}
        >
          <img src={img} alt={`Memory ${idx}`} className="w-full h-full object-cover" />
        </div>
      ))}
      {selectedMemory !== null && (
        <div className="absolute inset-0 bg-white p-4 rounded shadow-md">
          <img src={images[selectedMemory]} alt="Selected Memory" />
          <p>{memories[selectedMemory]}</p>
        </div>
      )}
    </div>
  );
};

export default MemoryBubbles;
