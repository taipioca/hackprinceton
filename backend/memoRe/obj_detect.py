import cv2
from ultralytics import YOLO

# Initialize YOLOv8 model
model = YOLO('yolov10n.pt')  # You can use other model sizes like 'yolov8s.pt', 'yolov8m.pt', etc.

# Initialize webcam
cap = cv2.VideoCapture(2) # check this

while True:
    # Read frame from webcam
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLOv8 inference on the frame
    results = model(frame)

    # Visualize the results on the frame
    annotated_frame = results[0].plot()

    for result in results:
        boxes = result.boxes
        for box in boxes:
            # Get the class ID and name
            class_id = int(box.cls[0])
            class_name = result.names[class_id]

            # Get the confidence score
            confidence = float(box.conf[0])

            # Print the detected class and confidence
            print(f"Detected: {class_name} (Confidence: {confidence:.2f})")

    # Display the annotated frame
    cv2.imshow("YOLOv10 Inference", annotated_frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Release the webcam and close windows
cap.release()
cv2.destroyAllWindows()
