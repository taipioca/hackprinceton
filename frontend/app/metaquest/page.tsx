"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const DetectMemoryPage: React.FC = () => {
  const [memoryData, setMemoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch memory every second
  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get("http://127.0.0.1:5000/get_image_memory")
        .then((response) => {
          if (response.data.status === "detecting") {
            setMemoryData(null);
          } else {
            setMemoryData(response.data);
          }
          setLoading(false); // Stop loading once data is fetched
        })
        .catch((error) => {
          console.error("Error fetching data", error);
          setLoading(false); // Stop loading if there is an error
        });
    }, 1000); // Fetch data every second

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : memoryData === null ? (
        // No object detected, show icon and message
        <div className="text-center">
          <div className="text-6xl">🤖</div>
          <div className="mt-4 text-xl">Nothing detected</div>
        </div>
      ) : (
        // Object detected, show the memory data
        <div className="text-center">
          <h2 className="text-3xl font-semibold">{memoryData.name}</h2>
          <p className="mt-2 text-lg">{memoryData.object_type}</p>
          <div className="mt-4">
            <strong>Memories:</strong>
            <ul className="list-disc pl-4 text-sm">
              {memoryData.memories.map((memory: string, idx: number) => (
                <li key={idx}>{memory}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <strong>Photos:</strong>
            <div className="flex space-x-2 mt-2">
              {memoryData.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={`data:image/png;base64,${img}`}
                  alt={`Image ${idx}`}
                  className="w-24 h-24 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectMemoryPage;
