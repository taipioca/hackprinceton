from memoRe import *
import cv2
from ultralytics import YOLO
import json
import requests
import threading

def get_info(query):
   url = 'http://localhost:5000/get_memory'
   params = {
        'name': query 
    }

   response = requests.get(url, params=params)
   if response.status_code == 200:
       return response 
 

model = YOLO('memoRe/best.pt') 
DETECT_THRESHOLD = 0.8
last_class = None

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

            # Print the detected class and confidence
            print(f"Detected: {class_name} (Confidence: {confidence:.2f})")
            if confidence >= DETECT_THRESHOLD:
                last_class = class_name
               
 
    # Display the annotated frame
    cv2.imshow("YOLOv10 Inference", annotated_frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()
