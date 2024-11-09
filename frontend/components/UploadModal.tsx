import React, { useState } from "react";

const UploadModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"person" | "object">("person");
  const [name, setName] = useState("");
  const [memories, setMemories] = useState<string[]>([""]); // Initialize with one memory input
  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleAddMemory = () => {
    setMemories([...memories, ""]); // Add an empty string for a new memory input
  };

  const handleMemoryChange = (index: number, value: string) => {
    const updatedMemories = [...memories];
    updatedMemories[index] = value;
    setMemories(updatedMemories); // Update the specific memory at index
  };

  const handleSubmit = () => {
    if (!name) {
      alert("Name is required");
      return;
    }

    // Create FormData object to send data including files
    const formData = new FormData();
    formData.append("name", name);
    formData.append("object_type", type);
    formData.append("memories", memories.join("|")); // Joining memories list with a separator

    // Append all images to formData
    images.forEach((file) => {
      formData.append("images", file);
    });

    // Send the form data to the backend
    fetch("http://127.0.0.1:5000/create_memory", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then(() => alert("Uploaded successfully"))
      .catch((err) => console.error("Upload failed", err));

    // Reset form
    setName("");
    setMemories([""]); // Reset memories to one empty field
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
              <p className="font-semibold">Memories:</p>
              {memories.map((memory, index) => (
                <div key={index} className="mb-2 flex items-center">
                  <input
                    type="text"
                    className="border p-2 w-full"
                    value={memory}
                    onChange={(e) => handleMemoryChange(index, e.target.value)}
                  />
                </div>
              ))}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                onClick={handleAddMemory}
              >
                Add Memory
              </button>
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
