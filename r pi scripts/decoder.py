import json
import base64
import cv2
import numpy as np

# Load JSON
with open("plant_disease_result.json", "r") as file:
    data = json.load(file)

# Extract values
label = data["label"]
confidence = data["confidence"]
signal = data["signal"]
image_b64 = data["image"]

# Decode image
image_data = base64.b64decode(image_b64)
image_np = np.frombuffer(image_data, np.uint8)
image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

# Display result
text = f"{label} ({confidence * 100:.2f}%)"
color = (0, 255, 0) if signal == "green" else (0, 255, 255) if signal == "yellow" else (0, 0, 255)
cv2.putText(image, text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 2, color, 3)
cv2.imshow("Decoded Prediction", image)
cv2.waitKey(0)
cv2.destroyAllWindows()

# Print info
print("\n--- Decoded JSON Data ---")
print(f"Label      : {label}")
print(f"Confidence : {confidence}")
print(f"Signal     : {signal.upper()}")
