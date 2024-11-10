import os
import base64
import sqlite3
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

# Set up Flask app
app = Flask(__name__)
CORS(app)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    # Create memories table if not exists
    c.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            object_type TEXT,
            memories TEXT,
            images TEXT
        )
    ''')
    # Create settings table to store last_class if not exists
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            last_class TEXT
        )
    ''')
    # Insert initial row with last_class set to None if the settings table is empty
    c.execute('SELECT last_class FROM settings WHERE id = 1')
    if c.fetchone() is None:
        c.execute('INSERT INTO settings (id, last_class) VALUES (1, NULL)')
    conn.commit()
    conn.close()

@app.route('/change_class', methods=['POST'])
def change_class():
    try:
        # Get the new class from the request payload
        new_class = request.json.get("class")
        
        # Query database to verify the class exists
        conn = sqlite3.connect('memories.db')
        c = conn.cursor()
        c.execute('SELECT name FROM memories WHERE name = ?', (new_class,))
        last_class_row = c.fetchone()
        
        if last_class_row:
            # Update last_class in the settings table
            c.execute('UPDATE settings SET last_class = ? WHERE id = 1', (new_class,))
            conn.commit()
            
            # Fetch memory details
            c.execute('SELECT name, object_type, memories, images FROM memories WHERE name = ?', (new_class,))
            row = c.fetchone()

            if row:
                name, object_type, memories_str, images_str = row
                memories = memories_str.split('|')
                images = images_str.split('|')
                return jsonify({
                    "name": name,
                    "object_type": object_type,
                    "memories": memories,
                    "images": images
                }), 200
        else:
            return jsonify({"status": "error", "message": "Memory not found"}), 404

    except Exception as e:
        return jsonify({"status": "error", "message": "Failed to change class"}), 400
    finally:
        conn.close()

# Endpoint to create memory
@app.route('/create_memory', methods=['POST'])
def create_memory():
    name = request.form.get('name')
    object_type = request.form.get('object_type')
    memories = request.form.getlist('memories')
    memories_str = '|'.join(memories)

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
            "images": images
        }), 200
    else:
        return jsonify({"status": "error", "message": "Memory not found"}), 404

# Endpoint to retrieve last class's memory
@app.route('/get_image_memory', methods=['GET'])
def get_image_memory():
    # Retrieve last_class from settings table
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute('SELECT last_class FROM settings WHERE id = 1')
    last_class_row = c.fetchone()
    last_class = last_class_row[0] if last_class_row else None

    if not last_class:
        return jsonify({"status": "detecting", "message": "No object detected"}), 200

    # Query database for the memory using the detected object class name
    c.execute('SELECT name, object_type, memories, images FROM memories WHERE name = ?', (last_class,))
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
            "images": images
        }), 200
    else:
        return jsonify({"status": "error", "message": "Memory not found"}), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
