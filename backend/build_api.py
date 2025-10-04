from fastapi import FastAPI , UploadFile, File , Form
from fastapi.middleware.cors import CORSMiddleware

import cv2
import numpy as np
import tempfile

import build_sql 

#python -m uvicorn build_api:app --reload
app = FastAPI()

# ✅ เปิดให้เรียกได้ทุก origin (แก้ถ้าอยากจำกัด)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"msg": "API Student Attendance Running ✅"}


#----------------- load on web ---------------------#
# Students
@app.get("/students")
def get_students():
    return build_sql.show_data_students(build_sql.DB_PATH)

# Students update
@app.put("/students/update")
def update_student(student_id: int, full_name: str):
    build_sql.update_student(student_id, full_name, build_sql.DB_PATH)
    return {"msg": f"อัปเดต student_id={student_id} สำเร็จ ✅"}

# walk-in
@app.get("/attendance")
def get_attendance():
    return build_sql.show_data_attendance(build_sql.DB_PATH)

# walk-in update
@app.put("/attendance/update")
def api_update_attendance(student_id: int, attendance_date: str, checkin: str, checkout: str):
    return build_sql.update_attendance(student_id, attendance_date, checkin, checkout, build_sql.DB_PATH)


# Students - Delete
@app.delete("/students/delete/{student_id}")
def api_delete_student(student_id: int):
    return build_sql.delete_student(student_id, build_sql.DB_PATH)


# Attendance - Delete
@app.delete("/attendance/delete/{attendance_id}")
def api_delete_attendance(attendance_id: int):
    return build_sql.delete_attendance(attendance_id, build_sql.DB_PATH)

# เพิ่มนักเรียน
@app.post("/students/add")
def api_add_student(student_id: int, full_name: str):
    build_sql.add_student(student_id, full_name, build_sql.DB_PATH)
    return {"msg": f"เพิ่มนักเรียน {full_name} (ID: {student_id}) สำเร็จ ✅"}


# เพิ่มข้อมูลเข้า-ออก (check-in/out)
@app.post("/attendance/add")
def api_add_attendance(student_id: int, attendance_date: str, checkin: str, checkout: str = None):
    build_sql.add_attendance(student_id, attendance_date, checkin, checkout, build_sql.DB_PATH)
    return {"msg": f"เพิ่มข้อมูลการเข้า-ออก student_id={student_id}, วันที่={attendance_date} สำเร็จ ✅"}

#----------------- load on web ---------------------#

#----------------- MODEL -----------------#

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("face_model.yml")
label_map = np.load("labels.npy", allow_pickle=True).item()

# โหลด Haar Cascade สำหรับตรวจจับใบหน้า
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


@app.post("/detect_face")
async def detect_face(file: UploadFile = File(...)):
    # อ่านไฟล์ภาพจาก request
    contents = await file.read()
    npimg = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if frame is None:
        return {"found": False, "error": "ไม่สามารถอ่านภาพได้"}

    # แปลงเป็น grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return {"found": False}

    # เลือกใบหน้าแรกที่เจอ (กรณีมีหลายหน้า)
    (x, y, w, h) = faces[0]
    roi_gray = gray[y:y+h, x:x+w]

    # พยากรณ์
    label, confidence = recognizer.predict(roi_gray)
    name = label_map.get(label, "Unknown")

    # กรองกรณีมั่นใจน้อยเกินไป (เช่น > 100 ถือว่าไม่แม่น)
    if confidence > 100:
        return {"found": True, "name": "Unknown", "confidence": float(confidence)}

    return {"found": True, "name": name, "confidence": float(confidence)}

#----------------- MODEL -----------------#

#----------------- Find  ------------------#
@app.get("/students/by-name")
def get_student_by_name(full_name: str):
    student = build_sql.get_student_by_name(full_name, build_sql.DB_PATH)
    if student:
        return student
    return {"error": "ไม่พบนักเรียนชื่อนี้"}

@app.get("/attendance/by-date")
def get_attendance_by_date(student_id: int, date: str):
    attendance = build_sql.get_attendance_by_date(student_id, date, build_sql.DB_PATH)
    if attendance:
        return attendance
    return {"error": "ไม่พบข้อมูลการเข้าออกในวันนี้"}


