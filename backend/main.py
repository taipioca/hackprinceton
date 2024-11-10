import base64
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    # Create memories table if not exists
    c.execute('''CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        object_type TEXT,
        memories TEXT,
        images TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS audio_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        encoded_mp3 TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        last_class TEXT
    )''')
    # Insert initial row with last_class set to None if the settings table is empty
    c.execute('SELECT last_class FROM settings WHERE id = 1')
    if c.fetchone() is None:
        c.execute('INSERT INTO settings (id, last_class) VALUES (1, NULL)')
    conn.commit()
    conn.close()

@app.route('/', methods = ['GET'])
def hello():
    return "Welcome to the API"


@app.route('/change_class', methods=['POST'])
def change_class():
    try:
        new_class = request.json.get("class")
        conn = sqlite3.connect('memories.db')
        c = conn.cursor()
        c.execute('SELECT name FROM memories WHERE name = ?', (new_class,))
        last_class_row = c.fetchone()

        if last_class_row:
            c.execute('UPDATE settings SET last_class = ? WHERE id = 1', (new_class,))
            conn.commit()
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

@app.route('/create_memory', methods=['POST'])
def create_memory():
    name = request.form.get('name')
    object_type = request.form.get('object_type')
    memories = request.form.getlist('memories')
    memories_str = '|'.join(memories)

    encoded_images = []
    images = request.files.getlist('images')
    for image in images:
        if image:
            image_stream = image.read()
            encoded_image = base64.b64encode(image_stream).decode('utf-8')
            encoded_images.append(encoded_image)

    images_str = '|'.join(encoded_images)

    conn = sqlite3.connect('memories.db')
    c = conn.cursor()
    c.execute('''INSERT INTO memories (name, object_type, memories, images)
                 VALUES (?, ?, ?, ?)''', (name, object_type, memories_str, images_str))
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "Memory created successfully!"}), 201

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)  # Change to the AWS-hosted IP if needed
