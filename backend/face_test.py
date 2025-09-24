import cv2
import numpy as np

# โหลดโมเดลและ label map
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("face_model.yml")
label_map = np.load("labels.npy", allow_pickle=True).item()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

cap = cv2.VideoCapture(0)  # เปิดกล้อง

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        roi_gray = gray[y:y+h, x:x+w]
        label, confidence = recognizer.predict(roi_gray)

        name = label_map.get(label, "Unknown")
        text = f"{name} ({confidence:.2f})"

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

    cv2.imshow("Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):  # กด q เพื่อออก
        break

cap.release()
cv2.destroyAllWindows()
