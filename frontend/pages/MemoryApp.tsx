"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadModal from "../components/UploadModal";
import UpdateModal from "../components/UpdateModal";
import { MemoryItem } from "../pages/types";

const MemoryApp: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [data, setData] = useState<MemoryItem[] | null>(null);
  const [filter, setFilter] = useState<"all" | "person" | "object">("all");

  // Function to fetch memory data based on filter using axios
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

  // Fetch data when filter changes
  useEffect(() => {
    handleFetchMemory();
  }, [filter]); // Only depend on filter

  return (
    <div className="p-4 space-y-4">
      {/* Filter Buttons */}
      <div className="flex space-x-4 justify-center">
        <button
          onClick={() => setFilter("person")}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          People
        </button>
        <button
          onClick={() => setFilter("object")}
          className="bg-green-500 text-white p-2 rounded-md"
        >
          Objects
        </button>
        <button
          onClick={() => setFilter("all")}
          className="bg-gray-500 text-white p-2 rounded-md"
        >
          All
        </button>
      </div>

      {/* Modals */}
      <div className="flex justify-between">
        <UploadModal />
      </div>

      {/* Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data ? (
          data.map((item, index) => (
            <div
              key={index}
              className="border p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm">{item.object_type}</p>
              <div className="mt-2">
                <strong>Memories:</strong>
                <ul className="list-disc pl-4 text-sm">
                  {item.memories.map((memory, idx) => (
                    <li key={idx}>{memory}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <strong>Images:</strong>
                <div className="flex space-x-2 mt-2">
                  {item.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={`data:image/png;base64,${img}`}
                      alt={`Image ${idx}`}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default MemoryApp;
