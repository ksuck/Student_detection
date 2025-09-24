from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

app = FastAPI()

# ---------------------------
# Allow frontend (index.html)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ปรับเป็น domain จริงได้
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Load LBPH model + labels
# ---------------------------
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("face_model.yml")
label_map = np.load("labels.npy", allow_pickle=True).item()

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ---------------------------
# API: Face Recognition
# ---------------------------
@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    try:
        # แปลงไฟล์ภาพเป็น OpenCV
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert("RGB")
        frame = np.array(image)

        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        results = []
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            label, confidence = recognizer.predict(roi_gray)
            name = label_map.get(label, "Unknown")
            results.append({
                "name": name,
                "confidence": float(confidence)
            })

        if not results:
            return {"name": "Unknown", "confidence": None}

        # ตอนนี้ส่งแค่ "ชื่อแรก" กลับไป (จะเหมือน index ล่าสุดที่คุณใช้)
        best_match = results[0]
        return {
            "name": best_match["name"],
            "confidence": best_match["confidence"]
        }

    except Exception as e:
        return {"error": str(e)}

# ---------------------------
# Run server
# ---------------------------
if __name__ == "__main__":
    uvicorn.run("back-end:app", host="0.0.0.0", port=8000, reload=True)
