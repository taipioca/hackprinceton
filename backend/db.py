import os
import base64
import sqlite3
import threading
import time
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
    # Main table for memories
    c.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            object_type TEXT,
            memories TEXT,
            images TEXT
        )
    ''')
    # Table for storing the last_class
    c.execute('''
        CREATE TABLE IF NOT EXISTS last_class (
            id INTEGER PRIMARY KEY,
            name TEXT
        )
    ''')
    # Initialize last_class to None if it doesn't exist
    c.execute("INSERT OR IGNORE INTO last_class (id, name) VALUES (1, NULL)")
    conn.commit()
    conn.close()

def reset_last_class():
    time.sleep(10)  # Wait for 10 seconds
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute("UPDATE last_class SET name = NULL WHERE id = 1")
    conn.commit()
    conn.close()

@app.route('/change_class', methods=['POST'])
def change_class():
    try:
        # Get the new class from the request payload
        new_class = request.json.get("class")
        
        # Update last_class in the database
        conn = sqlite3.connect('memories.db')
        c = conn.cursor()
        c.execute("UPDATE last_class SET name = ? WHERE id = 1", (new_class,))
        conn.commit()
        
        # Start a timer thread to reset last_class after 10 seconds
        threading.Thread(target=reset_last_class).start()

        # Fetch memory details for the given class
        c.execute('SELECT name, object_type, memories, images FROM memories WHERE name = ?', (new_class,))
        row = c.fetchone()
        conn.close()

        if row:
            print(row)
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

    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": "Failed to change class"}), 400

@app.route('/get_image_memory', methods=['GET'])
def get_image_memory():
    # Query the database for the last_class
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute("SELECT name FROM last_class WHERE id = 1")
    last_class_row = c.fetchone()
    conn.close()

    if not last_class_row or not last_class_row[0]:
        return jsonify({"status": "detecting", "message": "No object detected"}), 200

    # Fetch the memory associated with last_class
    last_class = last_class_row[0]
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
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

# Other endpoints remain unchanged

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
