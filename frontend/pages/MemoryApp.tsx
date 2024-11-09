"use client";

import React, { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import DisplayPanel from "../components/DisplayPanel";
import UploadModal from "../components/UploadModal";
import UpdateModal from "../components/UpdateModal";
import { MemoryItem } from "../pages/types";

const MemoryApp: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [data, setData] = useState<MemoryItem | null>(null);

  // Fetch and parse data when the dropdown changes
  useEffect(() => {
    if (selectedItem) {
      const type = selectedItem.includes(".json") ? "person" : "object";
      fetch(
        `/${
          type === "person" ? "sample_people" : "sample_objects"
        }/${selectedItem}`
      )
        .then((res) => res.json())
        .then(setData)
        .catch((err) => {
          console.error("Error fetching data", err);
          setData(null);
        });
    } else {
      setData(null); // Clear data when no item is selected
    }
  }, [selectedItem]);

  return (
    <div className="p-4 space-y-4">
      <Dropdown setSelectedItem={setSelectedItem} />
      {data && <DisplayPanel data={data} />}
      <div className="flex justify-between">
        <UpdateModal />
        <UploadModal />
      </div>
    </div>
  );
};

export default MemoryApp;
