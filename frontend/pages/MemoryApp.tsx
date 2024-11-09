"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadModal from "../components/UploadModal";
import { MemoryItem } from "../pages/types";
import UpdateModal from "@/components/UpdateModal";
import FilmRoll from "@/components/FilmRoll";

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
            <div key={index}>
              <FilmRoll data={item} />
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
