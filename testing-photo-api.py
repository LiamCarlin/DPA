import cv2

# Access the webcam (usually 0 for the default camera)
cap = cv2.VideoCapture(0)

# Check if the webcam is opened successfully
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

# Read a frame from the webcam
ret, frame = cap.read()

# Check if the frame was read successfully
if not ret:
    print("Error: Could not read frame.")
    exit()

# Save the frame as an image
cv2.imwrite("photo1.jpg", frame)

# Release the webcam
cap.release()

print("Photo taken successfully!")

from inference_sdk import InferenceHTTPClient

CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="js8xjrM64OxSpUnL7hsU"
)

result = CLIENT.infer("photo1.jpg", model_id="degen101/6")

print(result)
