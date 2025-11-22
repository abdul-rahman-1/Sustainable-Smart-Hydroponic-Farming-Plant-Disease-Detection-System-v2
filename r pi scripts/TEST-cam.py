import time
import numpy as np
import tensorflow as tf
import cv2
import base64
import json
from picamera2 import Picamera2

# Load class names
validation_set = tf.keras.utils.image_dataset_from_directory(
    'archive/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/valid',
    labels="inferred",
    label_mode="categorical",
    image_size=(128, 128)
)
class_names = validation_set.class_names
print("Class names:", class_names)

# Load trained model
cnn = tf.keras.models.load_model('trained_plant_disease_model.keras')

# Initialize PiCamera2
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (1920, 1080)}))
picam2.start()

confidence_threshold = 0.60  # below this, assume no plant

# Function to get plant signal (danger level)
def get_plant_signal(label, confidence):
    if "healthy" in label.lower():
        return "green"   # Healthy
    elif confidence >= 0.85:
        return "yellow"  # Mild risk
    else:
        return "red"     # Likely disease

# Function to convert image to base64
def frame_to_base64(frame_bgr):
    _, buffer = cv2.imencode('.jpg', frame_bgr)
    return base64.b64encode(buffer).decode('utf-8')

frames_info = []

try:
    for i in range(5):
        frame_rgb = picam2.capture_array()

        if frame_rgb.shape[-1] == 4:
            frame_rgb = frame_rgb[:, :, :3]

        img_resized = cv2.resize(frame_rgb, (128, 128))
        img_array = np.expand_dims(img_resized, axis=0)
        img_array = img_array / 255.0

        prediction = cnn.predict(img_array)
        confidence = np.max(prediction)
        predicted_class = class_names[np.argmax(prediction)]

        frames_info.append({
            'frame': frame_rgb.copy(),
            'confidence': confidence,
            'label': predicted_class
        })

        print(f"[{i+1}/5] Predicted: {predicted_class} with confidence {confidence:.4f}")
        time.sleep(2)

    confident_frames = [f for f in frames_info if f['confidence'] >= confidence_threshold]

    if not confident_frames:
        print("No plant found in any image.")
        fallback_frame = frames_info[-1]['frame']
        fallback_bgr = cv2.cvtColor(fallback_frame, cv2.COLOR_RGB2BGR)
        cv2.putText(fallback_bgr, "No plant found", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 3)
        cv2.imshow("No Plant", fallback_bgr)
        cv2.waitKey(0)

        output_data = {
            "label": "No plant found",
            "confidence": 0.0,
            "signal": "red",
            "image": frame_to_base64(fallback_bgr)
        }
        with open("plant_disease_result.json", "w") as json_file:
            json.dump(output_data, json_file, indent=4)

    else:
        best_frame = max(confident_frames, key=lambda x: x['confidence'])
        best_frame_bgr = cv2.cvtColor(best_frame['frame'], cv2.COLOR_RGB2BGR)
        text = f"{best_frame['label']} ({best_frame['confidence']*100:.2f}%)"
        cv2.putText(best_frame_bgr, text, (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)

        cv2.imshow("Best Prediction", best_frame_bgr)
        cv2.waitKey(1000)  # waits 1 second
        cv2.destroyWindow("Best Prediction")

        signal = get_plant_signal(best_frame['label'], best_frame['confidence'])

        output_data = {
            "label": best_frame['label'],
            "confidence": float(round(best_frame['confidence'], 4)),
            "signal": signal,
            "image": frame_to_base64(best_frame_bgr)
        }
        with open("plant_disease_result.json", "w") as json_file:
            json.dump(output_data, json_file, indent=4)


finally:
    picam2.stop()
    cv2.destroyAllWindows()
