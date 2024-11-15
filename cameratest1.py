from inference_sdk import InferenceHTTPClient
from PIL import Image

from ultralytics import YOLO
import os
from IPython.display import display, Image
from IPython import display
display.clear_output()
#!yolo mode=checks
import cv2

# Access the webcam (usually 0 for the default camera)
cap = cv2.VideoCapture(0)

# Save the frame as an image
while True:
    # Read a frame from the camera
    ret, frame = cap.read()

    frame = cv2.flip(frame, 1)

    # Display the frame
    cv2.imshow('Live Camera', frame)

    # take photo if 'q' is pressed
    if cv2.waitKey(1) == ord('q'):
        cv2.imwrite("photo1.jpg", frame)
        break

# Release the webcam
cap.release()

# Uses the infrence client to call API
CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="js8xjrM64OxSpUnL7hsU"
)

# Set the result
result = CLIENT.infer("photo1.jpg", model_id="degen101-original-stack-size-rn0ra/3")

# Display the result
print(result)