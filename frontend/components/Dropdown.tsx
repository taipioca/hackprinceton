import React, { useState, useEffect } from "react";

interface Props {
  setSelectedItem: (value: string) => void;
}

const Dropdown: React.FC<Props> = ({ setSelectedItem }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [type, setType] = useState<"person" | "object">("person");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/files/${type}`)
      .then((res) => res.json())
      .then((files) => setOptions(files))
      .catch((err) => console.error("Error fetching options", err));
  }, [type]);

  return (
    <div className="flex items-center space-x-4">
      <button
        className={`px-4 py-2 bg-blue-500 text-white rounded ${type === "person" ? "font-bold" : ""}`}
        onClick={() => setType("person")}
      >
        People
      </button>
      <button
        className={`px-4 py-2 bg-green-500 text-white rounded ${type === "object" ? "font-bold" : ""}`}
        onClick={() => setType("object")}
      >
        Objects
      </button>
      <select
        onChange={(e) => setSelectedItem(e.target.value)}
        className="px-4 py-2 border rounded"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(".json", "")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;