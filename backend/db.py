import os
import base64
import sqlite3
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import json
from memoRe import *
import cv2
from ultralytics import YOLO
import json
import requests
import threading

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


# Global variable to store the last detected class
last_class = None

@app.route('/image_recognition/get_memory', methods=['GET'])
def get_memory():
    # If no object is detected, return a message
    if not last_class:
        return jsonify({"status": "detecting", "message": "No object detected"}), 200

    # Query database for the memory using the detected object class name
    name = last_class

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

# Add the object detection logic that sets last_class
model = YOLO('memoRe/best.pt') 
DETECT_THRESHOLD = 0.8
last_class = None  # Variable to store the last detected class

cap = cv2.VideoCapture(2)
while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)

    annotated_frame = results[0].plot()

    for result in results:
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0])
            class_name = result.names[class_id]
            confidence = float(box.conf[0])

            if confidence >= DETECT_THRESHOLD:
                last_class = class_name  # Update the detected object class

    # Display the annotated frame
    cv2.imshow("YOLOv10 Inference", annotated_frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()


if __name__ == '__main__':
    app.run(debug=True)
