import cv2
import os

# -------- CONFIG --------
dataset_path = "dataset"   # โฟลเดอร์หลักเก็บ dataset
img_size = (200, 200)      # ขนาดภาพให้คงที่ (200x200 เสถียรสำหรับ LBPH)
num_samples = 30           # จำนวนรูปที่จะถ่ายต่อ 1 คน
# -------------------------

# ให้ผู้ใช้พิมพ์ชื่อ
name = input("กรอกชื่อบุคคล: ").strip()
# สร้างโฟลเดอร์สำหรับบุคคลนั้น
person_dir = os.path.join(dataset_path, name)
os.makedirs(person_dir, exist_ok=True)

# เปิดกล้อง
cap = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

count = 0
print("เริ่มเก็บข้อมูล กด 'q' เพื่อออก")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        roi = gray[y:y+h, x:x+w]               # ตัดเฉพาะหน้า
        roi_resized = cv2.resize(roi, img_size) # resize ให้เท่ากัน

        count += 1
        file_path = os.path.join(person_dir, f"{count}.jpg")
        cv2.imwrite(file_path, roi_resized)

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)
        cv2.putText(frame, f"{count}/{num_samples}", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)

    cv2.imshow("Collecting Faces", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    if count >= num_samples:
        break

cap.release()
cv2.destroyAllWindows()
print(f"✅ เก็บรูป {count} รูปเสร็จสิ้นในโฟลเดอร์ {person_dir}")