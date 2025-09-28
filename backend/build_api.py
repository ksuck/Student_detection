from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form


import build_sql 


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

