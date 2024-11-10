from memoRe import *
import cv2
from ultralytics import YOLO
import threading
import requests

DETECT_THRESHOLD = 0.8
FOCUS_THRESHOLD_FRAMES = 60


class MemoReRunner:
    def __init__(self):
        self.model = YOLO('memoRe/best.pt') 
        self.attention = {}
        self.attention["last_class"] = None
        self.attention["frame count"] = 0 

        self.last_focus_class = ""
        self.focused_class = ""

        self.sg = StoryGenerator()
        self.current_thread = None  # Track the current running thread

    def generate_and_send_info(self, query, sg):
        mapping = {"josiewang": "Josephine Wang",
                "leanntai": "LeAnn Tai",
                "chaitea": "Chai T",
                "edwardsun": "Edward Sun",
                "amoxicillin": "Blood pressure medicine"
                }

        response = requests.post("http://10.25.4.161:5000/change_class", json={"class": mapping[query]})
        response = response.json()

        story = sg.generate_story(response)
        TTS.generate_eleven_speech_file(story)

        self.last_focus_class = self.focused_class
        
    def run(self):
        cap = cv2.VideoCapture(0)

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = self.model(frame)

            annotated_frame = results[0].plot()

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    class_id = int(box.cls[0])
                    class_name = result.names[class_id]
                    confidence = float(box.conf[0])

                    if confidence >= DETECT_THRESHOLD:
                        self.attention["last_class"] = class_name

                    if self.attention["last_class"] == class_name:
                        self.attention["frame count"] += 1
                    else:
                        self.attention["frame count"] = 0

                    if self.attention["frame count"] >= FOCUS_THRESHOLD_FRAMES:
                        # only if thread is not alive, change focus, otherwise finish our current thread
                        if self.current_thread is not None and not self.current_thread.is_alive():
                            self.focused_class = self.attention["last_class"]
                        if self.current_thread is None:
                            self.focused_class = self.attention["last_class"]

            if self.focused_class != self.last_focus_class:
                if self.current_thread is None or not self.current_thread.is_alive():
                    self.current_thread = threading.Thread(target=self.generate_and_send_info, args=(self.focused_class, self.sg,))
                    self.current_thread.start()

            print("FOCUSED ON: ", self.focused_class)

            # Display the annotated frame
            cv2.imshow("YOLOv10 Inference", annotated_frame)

            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        # Release the webcam and close windows
        cap.release()
        cv2.destroyAllWindows()

import os
import base64
import sqlite3
from flask import Flask, request, jsonify
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
    # Create audio_files table to store base64-encoded MP3 files
    c.execute('''
        CREATE TABLE IF NOT EXISTS audio_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            encoded_mp3 TEXT
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
        return jsonify({"status": "error", "message": "Memory not found"}), 

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

@app.route('/edit_memory/<name>', methods=['PATCH'])
def edit_memory(name):
    conn = sqlite3.connect('memories.db')
    cursor = conn.cursor()

    # Retrieve the current memory data by name
    cursor.execute("SELECT * FROM memories WHERE name = ?", (name,))
    memory = cursor.fetchone()

    if not memory:
        return jsonify({"error": "Memory not found"}), 404

    # Parse the existing data
    memory_id, current_name, current_object_type, current_memories, current_images = memory

    # Get the new data from the request
    data = request.form

    # Handle the new memories (split by | when updating)
    new_memories = data.get('memories')
    if new_memories:
        # Split the memories string into a list by '|'
        new_memories = new_memories.split('|')

    # Handle the new images
    new_images = request.files.getlist('images')

    # Decode the existing images (Base64) from the database into a list
    existing_images = current_images.split('|') if current_images else []

    # Update the images (replacing old ones) and base64 encode them
    updated_images = existing_images  # start with existing images
    if new_images:
        for image in new_images:
            image_data = image.read()
            encoded_image = base64.b64encode(image_data).decode('utf-8')
            updated_images.append(encoded_image)

    # Prepare the updated data
    updated_memories = new_memories if new_memories else current_memories

    # Update the database with new data
    cursor.execute('''
        UPDATE memories
        SET object_type = ?, memories = ?, images = ?
        WHERE name = ?
    ''', (data.get('object_type', current_object_type), '|'.join(updated_memories), '|'.join(updated_images), name))

    conn.commit()
    conn.close()

    return jsonify({"message": "Memory updated successfully"}), 200

@app.route('/get_image_memory', methods=['GET'])
def get_image_memory():
    # Connect to the database
    conn = sqlite3.connect('memories.db')
    c = conn.cursor()

    # Retrieve last_class from settings table
    c.execute('SELECT last_class FROM settings WHERE id = 1')
    last_class_row = c.fetchone()
    last_class = last_class_row[0] if last_class_row else None
    print(last_class)

    if not last_class:
        conn.close()
        return jsonify({"status": "detecting", "message": "No object detected"}), 200

    # Query the memories table for the details of the last_class
    c.execute('SELECT name, object_type, memories, images FROM memories WHERE name = ?', (last_class,))
    row = c.fetchone()

    if not row:
        conn.close()
        return jsonify({"status": "error", "message": "Memory not found"}), 404

    name, object_type, memories_str, images_str = row
    memories = memories_str.split('|')
    images = images_str.split('|')

    # Retrieve the associated MP3 file from the mp3_files table
    c.execute('SELECT encoded_mp3 FROM audio_files WHERE id = 1')
    mp3_row = c.fetchone()
    mp3_str = mp3_row[0] if mp3_row else None

    conn.close()

    # Construct the JSON response with the retrieved data
    return jsonify({
        "name": name,
        "object_type": object_type,
        "memories": memories,
        "images": images,
        "mp3": mp3_str  # Include the Base64 encoded MP3 if it exists
    }), 200


if __name__ == '__main__':
    init_db()
    db_thread = threading.Thread(target=app.run, kwargs={"host": "10.25.4.161", "port": 5000})
    runner_obj = MemoReRunner()
    runner_thread = threading.Thread(target=runner_obj.run)
    db_thread.start()
    runner_thread.start()
