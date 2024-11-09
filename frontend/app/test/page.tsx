"use client";

import React, { useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [name, setName] = useState('');
    const [objectType, setObjectType] = useState('');
    const [memories, setMemories] = useState(['']);
    const [images, setImages] = useState([]);
    const [fetchedMemory, setFetchedMemory] = useState(null);
    const [fetchName, setFetchName] = useState('');

    // Handle memory creation
    const handleCreateMemory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('object_type', objectType);
        memories.forEach(memory => formData.append('memories', memory));
        Array.from(images).forEach(image => formData.append('images', image));

        try {
            const response = await axios.post('http://127.0.0.1:5000/create_memory', formData);
            alert(response.data.message);
        } catch (error) {
            console.error('Error creating memory:', error);
            alert('Failed to create memory');
        }
    };

    // Handle fetching memory
    const handleFetchMemory = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get('http://127.0.0.1:5000/get_memory', {
                params: { name: fetchName }
            });
            setFetchedMemory(response.data);
        } catch (error) {
            console.error('Error fetching memory:', error);
            alert('Memory not found');
        }
    };

    // Render form fields for memories
    const handleMemoryChange = (index, value) => {
        const updatedMemories = [...memories];
        updatedMemories[index] = value;
        setMemories(updatedMemories);
    };

    // Add a new memory input field
    const addMemoryField = () => setMemories([...memories, '']);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Create a Memory</h1>
            <form onSubmit={handleCreateMemory}>
                <div>
                    <label>Name: </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Object Type: </label>
                    <input type="text" value={objectType} onChange={(e) => setObjectType(e.target.value)} required />
                </div>
                <div>
                    <label>Memories: </label>
                    {memories.map((memory, index) => (
                        <input
                            key={index}
                            type="text"
                            value={memory}
                            onChange={(e) => handleMemoryChange(index, e.target.value)}
                            required
                        />
                    ))}
                    <button type="button" onClick={addMemoryField}>Add Memory</button>
                </div>
                <div>
                    <label>Images: </label>
                    <input type="file" multiple onChange={(e) => setImages(e.target.files)} />
                </div>
                <button type="submit">Create Memory</button>
            </form>

            <hr />

            <h1>Get a Memory</h1>
            <form onSubmit={handleFetchMemory}>
                <div>
                    <label>Memory Name: </label>
                    <input type="text" value={fetchName} onChange={(e) => setFetchName(e.target.value)} required />
                </div>
                <button type="submit">Fetch Memory</button>
            </form>

            {fetchedMemory && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Memory Details:</h2>
                    <p><strong>Name:</strong> {fetchedMemory.name}</p>
                    <p><strong>Object Type:</strong> {fetchedMemory.object_type}</p>
                    <p><strong>Memories:</strong> {fetchedMemory.memories.join(', ')}</p>
                    <div>
                        <strong>Images:</strong>
                        {fetchedMemory.images?.map((img, index) => (
                            <div key={index}>
                                <img
                                    src={`data:image/jpeg;base64,${img}`}
                                    alt={`Memory image ${index + 1}`}
                                    style={{ width: '200px', margin: '10px' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
