#python 3.9
import sqlite3
import os

def create_table(path):
    # สร้าง/เชื่อมต่อ database (ไฟล์ student_attendance.db)
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    # สร้างตาราง students
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        student_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        full_name TEXT NOT NULL
    );
    """)
    #มีการป้องกัน AUTOINCREMENT ป้องกันการเพิ่มข้อมูลซ้ำ

    # สร้างตาราง attendance
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        attendance_date DATE NOT NULL,
        checkin_time DATETIME,
        checkout_time DATETIME,
        FOREIGN KEY(student_id) REFERENCES students(student_id)
    );
    """)
    
    #มีการป้องกัน AUTOINCREMENT ป้องกันการเพิ่มข้อมูลซ้ำ


    conn.commit()
    print("สร้างตารางเรียบร้อยแล้ว ✅")
    conn.close()

#เพิ่มนักเรียน
def add_student(student_code, full_name, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO students (student_id, full_name)
        VALUES (?, ?)
    """, (student_code, full_name))
    conn.commit()
    conn.close()
    print("เพิ่มนักเรียนเรียบร้อยแล้ว ✅")

#ฝั่ง user check-in เข้า รร ตอนเช้า
def add_attendance(student_id, attendance_date, checkin_time, checkout_time, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO attendance (student_id, attendance_date, checkin_time, checkout_time)
        VALUES (?, ?, ?, ?)
    """, (student_id, attendance_date, checkin_time, checkout_time))
    conn.commit()
    conn.close()
    print(f"เพิ่มข้อมูลการเข้าออกของ student_id={student_id} เรียบร้อย ✅")


#
def show_tables(path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]  # ดึงเฉพาะชื่อ table
    conn.close()

    for t in tables:
        print("-", t)

    return tables

#ดูรายชื่อนักเรียน
def show_data_students(path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM students;")
    rows = cursor.fetchall()

    # เอาชื่อคอลัมน์ออกมาด้วย
    col_names = [description[0] for description in cursor.description]

    conn.close()

    # return เป็น list ของ dict
    return [dict(zip(col_names, row)) for row in rows]

#ดูรายการ walk-in
def show_data_attendance(path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM attendance;")
    rows = cursor.fetchall()
    col_names = [description[0] for description in cursor.description]  # ได้ชื่อคอลัมน์

    conn.close()

    # แปลงข้อมูลเป็น list ของ dict
    result = [dict(zip(col_names, row)) for row in rows]

    return result

#update ข้อมูลนักเรียน
def update_student(student_id, new_name, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE students
        SET full_name = ?
        WHERE student_id = ?
    """, (new_name, student_id))

    conn.commit()
    conn.close()
    print(f"แก้ไขข้อมูล student_id={student_id} เรียบร้อย ✅")


#แก้ไขทั้ง walkin checkout
def update_attendance(student_id, attendance_date, new_checkin, new_checkout, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE attendance
        SET checkin_time = ?, checkout_time = ?
        WHERE student_id = ? AND attendance_date = ?
    """, (new_checkin, new_checkout, student_id, attendance_date))

    conn.commit()
    conn.close()

#ลบข้อมูลนักเรียน
def delete_student(student_id, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM students WHERE student_id = ?", (student_id,))

    conn.commit()
    conn.close()
    print(f"ลบข้อมูล student_id={student_id} เรียบร้อย ✅")

#ลบข้อมูลเข้าออก
def delete_attendance(attendance_id, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM attendance WHERE attendance_id = ?", (attendance_id,))
    conn.commit()
    conn.close()
    print(f"ลบข้อมูล attendance_id={attendance_id} เรียบร้อย ✅")


#ค้นหา ชื่อ full name
def get_student_by_name(full_name, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT student_id, full_name
        FROM students
        WHERE full_name = ?
        LIMIT 1
    """, (full_name,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {"student_id": row[0], "full_name": row[1]}
    return None

# หาการเข้าออกของนักเรียนตามวันที่
def get_attendance_by_date(student_id, attendance_date, path):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT attendance_id, student_id, attendance_date, checkin_time, checkout_time
        FROM attendance
        WHERE student_id = ? AND attendance_date = ?
        LIMIT 1
    """, (student_id, attendance_date))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "attendance_id": row[0],
            "student_id": row[1],
            "attendance_date": row[2],
            "checkin_time": row[3],
            "checkout_time": row[4]
        }
    return None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "student_attendance.db")
if __name__ == "__main__":
    



    '''
    CREATE TABLE ใช้ครั้งเดียวในการสร้าง DB

    create_table(DB_PATH) #<---- add table
    '''
    
    '''
    เพิ่มนักเรียน
    add_student(66545202010,"ชุติพงศ์ ชูเลิศ",DB_PATH)
    
    รายชื่อหัวข้อ
    show_tables(DB_PATH)
    รายชื่อนักเรียน 
    show_data_students(DB_PATH)

    #แก้ไขข้อมูลนักเรียน
    update_student(66545202010,"ชุติพงศ์ ชูเลิศ (แก้ไขแล้ว)",DB_PATH)

    #นักเรียน
    delete_student(66545202010,DB_PATH)
    
    '''
    
    #ข้อมูลนักเรียน
    #add_student(66545202010,"build",DB_PATH)
    show_data_students(DB_PATH)
    '''
    ดูฐานข้อมูลนักเรียน
    show_data_attendance(DB_PATH)

    เพิ่มข้อมูลนักเรียนครั้งแรกตอนเช้า
    add_attendance(66545202010, "2025-09-26", "08:00:00", None, DB_PATH)

    update หลังจากเลิกเรียนหรือแก้ไขข้อมูล
    #update_attendance(66545202010, "2025-09-26", "08:05:00" ,"16:10:00", DB_PATH)
    
    #ลบรหัสนศศึกษาทั้งหมด
    #delete_attendance(0, DB_PATH)
    '''

    
    #ข้อมูลการเข้าโรงเรียน
    #add_attendance(66545202010, "2025-09-26", "08:00:00", None, DB_PATH)
    show_data_attendance(DB_PATH)
    

    