"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import UploadModal from "../components/UploadModal";
import UpdateModal from "../components/UpdateModal";
import { MemoryItem } from "../pages/types";

const MemoryList: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [data, setData] = useState<MemoryItem[] | null>(null);
  const [filter, setFilter] = useState<"all" | "person" | "object">("all");

  const filmRef = useRef<HTMLDivElement>(null);

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

  // Filter data based on the selected filter type
  const filteredData = data
    ? data.filter((item) =>
        filter === "all" ? true : item.object_type === filter
      )
    : [];

  // Handle the scrolling with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (filmRef.current) {
      // Scroll the film left or right depending on the wheel direction
      filmRef.current.scrollLeft += e.deltaY; // deltaY controls the horizontal scroll
      e.preventDefault(); // Prevent default scroll behavior
    }
  };

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
        <UpdateModal />
        <UploadModal />
      </div>

      {/* Display Film Roll Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredData.map((item, index) => (
          <div key={index} className="text-center">
            {/* Film Roll Wrapper with alternating black and white border */}
            <div
              className="relative overflow-x-auto"
              style={{
                width: "100%",
                height: "200px", // Fixed height for the film roll
                border: "4px solid transparent", // Transparent border for alternating effect
                borderImage: "linear-gradient(to right, black 50%, white 50%)", // Alternating black/white border
                borderImageSlice: 1,
                borderRadius: "8px",
                background: `url('/film.png') no-repeat center center`, // Set the film background
                backgroundSize: "cover", // Cover the whole background area with the image
                padding: "4px 0", // To add space inside the film roll
              }}
              onWheel={handleWheel} // Attach wheel event to scroll film
              ref={filmRef} // Ref for film container
            >
              {/* Scrollable Film Strip */}
              <div
                className="flex space-x-2"
                style={{
                  width: `${item.images.length * 96}px`, // Adjust the width based on number of images
                  cursor: "grab", // Indicate that the film is scrollable
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {item.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`data:image/png;base64,${img}`}
                    alt={`Image ${idx}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>

            {/* Person's Name and Info Below Film Roll */}
            <div className="mt-2">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-sm mt-1">{item.object_type}</p>
              <div className="mt-2">
                <strong>Memories:</strong>
                <ul className="list-disc pl-4 text-sm">
                  {item.memories.map((memory, idx) => (
                    <li key={idx}>{memory}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryList;
