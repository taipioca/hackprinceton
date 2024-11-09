from memoRe import *
import cv2
from ultralytics import YOLO
import json
import requests
import threading

def generate_and_send_info():
    
 

model = YOLO('memoRe/best.pt') 
DETECT_THRESHOLD = 0.8
FOCUS_THRESHOLD_FRAMES = 60
attention = {}
attention["last_class"] = None
attention["frame count"] = 0 

last_focus_class = ""
focused_class = ""


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
            # print(f"Detected: {class_name} (Confidence: {confidence:.2f})")
            if confidence >= DETECT_THRESHOLD:
                attention["last_class"] = class_name

            if attention["last_class"] == class_name:
                attention["frame count"] += 1
            else:
                attention["frame count"] = 0

            if attention["frame count"] >= FOCUS_THRESHOLD_FRAMES:
                focused_class = attention["last_class"]

    if (focused_class != last_focus_class):
        image_thread = Thread(target=)


    print("FOCUSED ON: ", focused_class)
               
 
    # Display the annotated frame
    cv2.imshow("YOLOv10 Inference", annotated_frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()
