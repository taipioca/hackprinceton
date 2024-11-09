from memoRe import *
import cv2
from ultralytics import YOLO
import threading

model = YOLO('memoRe/best.pt') 
DETECT_THRESHOLD = 0.8
FOCUS_THRESHOLD_FRAMES = 60
attention = {}
attention["last_class"] = None
attention["frame count"] = 0 

last_focus_class = ""
focused_class = ""

dbr = DataRetriever()
current_thread = None  # Track the current running thread

def generate_and_send_info(query, dbr):
    mapping = {"josiewang": "Josie",
               "leanntai": "Leann"}
    
    story, _ = dbr.retrieve_memory(mapping[query])
    TTS.generate_eleven_speech(story)

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
                attention["last_class"] = class_name

            if attention["last_class"] == class_name:
                attention["frame count"] += 1
            else:
                attention["frame count"] = 0

            if attention["frame count"] >= FOCUS_THRESHOLD_FRAMES:
                focused_class = attention["last_class"]

    # new focus
    if focused_class != last_focus_class:
        last_focus_class = focused_class
        if current_thread is None or not current_thread.is_alive():
            current_thread = threading.Thread(target=generate_and_send_info, args=(focused_class, dbr,))
            current_thread.start()

    print("FOCUSED ON: ", focused_class)
               
 
    # Display the annotated frame
    cv2.imshow("YOLOv10 Inference", annotated_frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()
