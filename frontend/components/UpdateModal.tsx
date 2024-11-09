import React, { useState, useEffect } from "react";
import { MemoryItem } from "../pages/types";

const UpdateModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"person" | "object">("person");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [data, setData] = useState<MemoryItem | null>(null);

  useEffect(() => {
    if (showModal) {
      const folder = type === "person" ? "sample_people" : "sample_objects";
      fetch(`/${folder}`) // Fetch folder names instead of files
        .then((res) => res.json())
        .then(setFiles) // `setFiles` should receive the folder names here
        .catch((err) => console.error("Error fetching files", err));
    }
  }, [showModal, type]);

  useEffect(() => {
    if (selectedFile) {
      fetch(`http://127.0.0.1:5000/files/${type}/${selectedFile}`)
        .then((res) => res.json())
        .then(setData)
        .catch((err) => console.error("Error fetching data", err));
    }
  }, [selectedFile]);

  const handleSubmit = () => {
    if (!data) {
      alert("No data to update");
      return;
    }

    fetch(`http://127.0.0.1:5000/files/${type}/${selectedFile}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(() => alert("Updated successfully"))
      .catch((err) => console.error("Update failed", err));

    setShowModal(false);
  };

  return (
    <div>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={() => setShowModal(true)}
      >
        Update Existing
      </button>
      {showModal && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Update Item</h2>
            <div className="mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  value="person"
                  checked={type === "person"}
                  onChange={() => setType("person")}
                />
                Person
              </label>
              <label>
                <input
                  type="radio"
                  value="object"
                  checked={type === "object"}
                  onChange={() => setType("object")}
                />
                Object
              </label>
            </div>
            <div className="mb-4">
              <select
                onChange={(e) => setSelectedFile(e.target.value)}
                className="border p-2 w-full"
              >
                <option value="">Select a file</option>
                {files.map((file) => (
                  <option key={file} value={file}>
                    {file.replace(".json", "")}
                  </option>
                ))}
              </select>
            </div>
            {data && (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    className="border p-2 w-full"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    className="border p-2 w-full"
                    value={data.memories.join(", ")}
                    onChange={(e) =>
                      setData({
                        ...data,
                        memories: e.target.value
                          .split(",")
                          .map((s) => s.trim()),
                      })
                    }
                  />
                </div>
                <p className="text-gray-500">
                  Note: Images cannot be edited here. Upload new data to change
                  images.
                </p>
              </>
            )}
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateModal;
