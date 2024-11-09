from flask import Flask, jsonify, request
import os
import json

app = Flask(__name__)

# Helper to get the directory path
def get_directory_path(item_type):
    base_path = os.path.dirname(os.path.abspath(__file__))
    if item_type == "person":
        return os.path.join(base_path, "sample_people")
    elif item_type == "object":
        return os.path.join(base_path, "sample_objects")
    return None

# Route to fetch file names
@app.route("/files/<item_type>", methods=["GET"])
def fetch_files(item_type):
    directory_path = get_directory_path(item_type)
    if not directory_path:
        return jsonify({"error": "Invalid type. Must be 'person' or 'object'."}), 400

    try:
        files = os.listdir(directory_path)
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": f"Unable to scan directory: {str(e)}"}), 500

# Route to save a new file
@app.route("/files/<item_type>", methods=["POST"])
def save_file(item_type):
    directory_path = get_directory_path(item_type)
    if not directory_path:
        return jsonify({"error": "Invalid type. Must be 'person' or 'object'."}), 400

    data = request.json
    if not data.get("name"):
        return jsonify({"error": "Name is required."}), 400

    file_path = os.path.join(directory_path, f"{data['name']}.json")
    try:
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
        return jsonify({"message": "File saved successfully."})
    except Exception as e:
        return jsonify({"error": f"Unable to save file: {str(e)}"}), 500

# Route to update an existing file
@app.route("/files/<item_type>/<file_name>", methods=["PUT"])
def update_file(item_type, file_name):
    directory_path = get_directory_path(item_type)
    if not directory_path:
        return jsonify({"error": "Invalid type. Must be 'person' or 'object'."}), 400

    file_path = os.path.join(directory_path, file_name)
    if not os.path.exists(file_path):
        return jsonify({"error": "File does not exist."}), 404

    data = request.json
    try:
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
        return jsonify({"message": "File updated successfully."})
    except Exception as e:
        return jsonify({"error": f"Unable to update file: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
