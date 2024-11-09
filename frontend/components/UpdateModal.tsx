import React, { useState, useEffect } from "react";
import { MemoryItem } from "../pages/types";

const UpdateModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"person" | "object">("person");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [data, setData] = useState<MemoryItem | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // State to store selected image files

  useEffect(() => {
    if (showModal) {
      // Fetch from dump_memories endpoint to get all people and objects
      fetch("http://127.0.0.1:5000/dump_memory")
        .then((res) => res.json())
        .then((memories) => {
          // Filter memories based on the selected type (person or object)
          const filteredFiles = memories
            .filter((memory: MemoryItem) => memory.object_type === type)
            .map((memory: MemoryItem) => memory.name); // Get the names of the filtered memories
          setFiles(filteredFiles); // Set the list of files based on the selected type
        })
        .catch((err) => console.error("Error fetching memories", err));
    }
  }, [showModal, type]);

  useEffect(() => {
    if (selectedFile) {
      fetch(`http://127.0.0.1:5000/get_memory?name=${selectedFile}`)
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
  
    // Create FormData to handle both JSON data and images
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("object_type", data.object_type);
    
    // Join memories with '|' separator
    const memoriesString = data.memories.join("|");
    formData.append("memories", memoriesString); // Send joined memories string
    
    // Append the selected image files to the form data
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  
    // Send PATCH request with memory name
    fetch(`http://127.0.0.1:5000/edit_memory/${data.name}`, { 
      method: "PATCH", 
      body: formData,
    })
      .then(() => alert("Updated successfully"))
      .catch((err) => console.error("Update failed", err));
  
    setShowModal(false);
  };  

  const handleMemoryChange = (index: number, value: string) => {
    const updatedMemories = [...(data?.memories || [])];
    updatedMemories[index] = value;
    setData({ ...data!, memories: updatedMemories });
  };

  const handleAddMemory = () => {
    if (data) {
      setData({
        ...data,
        memories: [...data.memories, ""], // Add an empty memory
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(Array.from(event.target.files)); // Convert FileList to an array
    }
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
                  <p>Memories:</p>
                  {data.memories.map((memory, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        className="border p-2 w-full"
                        value={memory}
                        onChange={(e) => handleMemoryChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleAddMemory}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add Memory
                  </button>
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="border p-2 w-full"
                  />
                  <p className="text-gray-500">
                    You can upload multiple images. New images will replace old ones.
                  </p>
                </div>
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
