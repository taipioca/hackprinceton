"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadModal from "../components/UploadModal";
import { MemoryItem } from "../pages/types";
import UpdateModal from "@/components/UpdateModal";
import DisplayPanel from "@/components/DisplayPanel";

const MemoryBubbles: React.FC<{
  memories: string[];
  images: string[];
}> = ({ memories, images }) => {
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={() => setSelectedMemory(idx)}
          >
            <img
              src={`data:image/png;base64,${img}`}
              alt={`Memory ${idx}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      {selectedMemory !== null && (
        <div className="absolute top-20 left-0 right-0 bg-white p-4 rounded-lg shadow-lg z-10">
          <button
            onClick={() => setSelectedMemory(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
          <img
            src={`data:image/png;base64,${images[selectedMemory]}`}
            alt="Selected Memory"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-700">{memories[selectedMemory]}</p>
        </div>
      )}
    </div>
  );
};

const MemoryApp: React.FC = () => {
  const [data, setData] = useState<MemoryItem[] | null>(null);
  const [filter, setFilter] = useState<"all" | "person" | "object">("all");

  const handleFetchMemory = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/dump_memory?type=${filter}`
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching data", err);
      setData(null);
    }
  };

  useEffect(() => {
    handleFetchMemory();
  }, [filter]);

  return (
    <div className="p-4 space-y-8">
      <div className="flex space-x-4 justify-center">
        <button
          onClick={() => setFilter("person")}
          className={`px-4 py-2 rounded-md transition-colors ${
            filter === "person"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-blue-100"
          }`}
        >
          People
        </button>
        <button
          onClick={() => setFilter("object")}
          className={`px-4 py-2 rounded-md transition-colors ${
            filter === "object"
              ? "bg-green-500 text-white"
              : "bg-gray-200 hover:bg-green-100"
          }`}
        >
          Objects
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md transition-colors ${
            filter === "all"
              ? "bg-gray-500 text-white"
              : "bg-gray-200 hover:bg-gray-100"
          }`}
        >
          All
        </button>
      </div>

      <div className="flex justify-end">
        <UpdateModal />
        <UploadModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data ? (
          data.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              {/* <h3 className="text-xl font-semibold mb-4">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.object_type}</p>
              <MemoryBubbles memories={item.memories} images={item.images} /> */}
              <DisplayPanel data={item} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No memories available
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryApp;
