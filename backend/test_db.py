import requests

# Base URL of the Flask app
BASE_URL = 'http://127.0.0.1:5000'

def test_change_class(new_class):
    url = f'{BASE_URL}/change_class'
    payload = {"class": new_class}
    response = requests.post(url, json=payload)
    print(f"POST /change_class with class '{new_class}'")
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
    print()

def test_get_image_memory():
    url = f'{BASE_URL}/get_image_memory'
    response = requests.get(url)
    print("GET /get_image_memory")
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
    print()

if __name__ == "__main__":
    # Test by setting a class name and then fetching the memory
    test_change_class("Josephine Wang")  # Replace with an actual class name in your database
    test_get_image_memory()
