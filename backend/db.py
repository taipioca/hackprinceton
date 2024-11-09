import os
import base64
import sqlite3
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import json

# Set up Flask app
app = Flask(__name__)
CORS(app)

# Create folder to save uploaded images (optional if not saving images as files)
UPLOAD_FOLDER = 'uploaded_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            object_type TEXT,
            memories TEXT,
            images TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Endpoint to create memory
@app.route('/create_memory', methods=['POST'])
def create_memory():
    name = request.form.get('name')
    object_type = request.form.get('object_type')
    memories = request.form.getlist('memories')
    memories_str = '|'.join(memories)  # Concatenate memories list for storage

    # Encode images to Base64
    encoded_images = []
    images = request.files.getlist('images')
    for image in images:
        if image:
            image_stream = image.read()
            encoded_image = base64.b64encode(image_stream).decode('utf-8')
            encoded_images.append(encoded_image)

    # Join encoded images with a separator
    images_str = '|'.join(encoded_images)

    # Insert data into SQLite database
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO memories (name, object_type, memories, images)
        VALUES (?, ?, ?, ?)
    ''', (name, object_type, memories_str, images_str))
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "Memory created successfully!"}), 201

# Endpoint to retrieve memory by name
@app.route('/get_memory', methods=['GET'])
def get_memory():
    name = request.args.get('name')

    # Query database
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute('SELECT name, object_type, memories, images FROM memories WHERE name = ?', (name,))
    row = c.fetchone()
    conn.close()

    if row:
        name, object_type, memories_str, images_str = row
        memories = memories_str.split('|')
        images = images_str.split('|')
        return jsonify({
            "name": name,
            "object_type": object_type,
            "memories": memories,
            "images": images  # Images are now Base64 encoded strings
        }), 200
    else:
        return jsonify({"status": "error", "message": "Memory not found"}), 404

# Endpoint to dump all memories
@app.route('/dump_memory', methods=['GET'])
def dump_memory():
    filter_type = request.args.get('type', 'all')

    # Query database for all memory entries
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()

    if filter_type == 'all':
        c.execute('SELECT name, object_type, memories, images FROM memories')
    else:
        c.execute('SELECT name, object_type, memories, images FROM memories WHERE object_type = ?', (filter_type,))

    rows = c.fetchall()
    conn.close()

    # Prepare all data
    memories_list = []
    for row in rows:
        name, object_type, memories_str, images_str = row
        memories = memories_str.split('|')
        images = images_str.split('|')
        memories_list.append({
            "name": name,
            "object_type": object_type,
            "memories": memories,
            "images": images  # Images are now Base64 encoded strings
        })

    return jsonify(memories_list), 200

from flask_cors import cross_origin

@app.route('/edit_memory/<int:memory_id>', methods=['PATCH'])
@cross_origin()  # Allow CORS for this specific route
def edit_memory(memory_id):
    # Extract the new data from the form
    name = request.form.get('name')
    memories = request.form.getlist('memories')  # Handle the list of memories from dynamic textboxes
    memories_str = '|'.join(memories) if memories else None  # Concatenate memories list for storage

    # Encode new images to Base64 if provided
    encoded_images = []
    images = request.files.getlist('images')
    for image in images:
        if image:
            image_stream = image.read()
            encoded_image = base64.b64encode(image_stream).decode('utf-8')
            encoded_images.append(encoded_image)

    images_str = '|'.join(encoded_images) if encoded_images else None

    # Query to find the memory
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute('SELECT memories, images FROM memories WHERE id = ?', (memory_id,))
    row = c.fetchone()

    if row:
        current_memories, current_images = row
        # Combine current memories with the new ones, avoid empty additions
        updated_memories = current_memories
        if memories_str:
            updated_memories = current_memories + '|' + memories_str if current_memories else memories_str

        # Combine current images with the new ones, avoid empty additions
        updated_images = current_images
        if images_str:
            updated_images = current_images + '|' + images_str if current_images else images_str

        # Update the memory in the database
        c.execute(''' 
            UPDATE memories 
            SET name = ?, memories = ?, images = ?
            WHERE id = ?
        ''', (name, updated_memories, updated_images, memory_id))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Memory updated successfully!"}), 200
    else:
        conn.close()
        return jsonify({"status": "error", "message": "Memory not found"}), 404



if __name__ == '__main__':
    app.run(debug=True)
