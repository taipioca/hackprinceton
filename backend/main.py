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
                "chaitea": "Chai Tea",
                "edwardsun": "Edward Sun",
                "amoxicillin": "Blood pressure medicine"
                }

        response = requests.post("http://127.0.0.1:5000/change_class", json={"class": mapping[query]})
        response = response.json()

        story = sg.generate_story(response)
        TTS.generate_eleven_speech(story)

        self.last_focus_class = self.focused_class
        

    def run(self):
        cap = cv2.VideoCapture(2)

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


if __name__ == "__main__":
    runner_obj = MemoReRunner()
    runner_obj.run()
