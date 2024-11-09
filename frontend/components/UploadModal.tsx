import React, { useState } from "react";

const UploadModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"person" | "object">("person");
  const [name, setName] = useState("");
  const [memories, setMemories] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = () => {
    if (!name) {
      alert("Name is required");
      return;
    }

    const jsonData = {
      type,
      name,
      memories,
      images: images.map((file) => `/images/${file.name}`),
    };

    // Save JSON to the Flask backend
    fetch(`http://127.0.0.1:5000/files/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    })
      .then(() => alert("Uploaded successfully"))
      .catch((err) => console.error("Upload failed", err));

    // Reset form
    setName("");
    setMemories([]);
    setImages([]);
    setShowModal(false);
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => setShowModal(true)}
      >
        Upload New
      </button>
      {showModal && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Upload New Item</h2>
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
              <input
                type="text"
                placeholder="Name"
                className="border p-2 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Memories (comma separated)"
                className="border p-2 w-full"
                value={memories.join(", ")}
                onChange={(e) =>
                  setMemories(e.target.value.split(",").map((s) => s.trim()))
                }
              />
            </div>
            <div className="mb-4">
              <input type="file" multiple onChange={handleFileChange} />
              <p className="text-gray-500">
                Selected files: {images.map((img) => img.name).join(", ")}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
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

export default UploadModal;
