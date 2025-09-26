student = [
    {'id': '66545202014', 'Name': 'Tang',    'Rname': 'Tharistree'},
    {'id': '6654520202 ', 'Name': 'build',    'Rname': 'Chutipong'},
    {'id': '6654520203', 'Name': 'Fang',    'Rname': 'Apisak'},
    {'id': '6654520204', 'Name': 'Jang',    'Rname': 'Junmueng'},
    {'id': '66545202051', 'Name': 'Jib',    'Rname': 'Warin'},
    
]
def show_menu():
    print("\n===== เมนูจัดการรายชื่อ =====")
    print("1. แสดงรายชื่อนักเรียน")
    print("2. เพิ่มชื่อนักเรียน")
    print("3. ลบนักเรียนตามรหัส")
    print("4. อัปเดตชื่อจริงนักเรียน")
    print("5. ค้นหานักเรียน")
    print("6. ออกจากโปรแกรม")

def show_student():
    print("\nรายชื่อนักเรียน:")
    for p in student:
        print(f"{p['id']} | ชื่อเล่น : {p['Name']:8} | ชื่อจริง: {p['Rname']} ")

def add_student():
    pid = input("รหัส: ")
    Name = input("ชื่อ: ")
    while True:
     Rname = (input("ชื่อจริง: "))
     if Rname.split():
      break
     else:
         print("text only")
    student.append({'id': pid, 'Name': Name, 'Rname': Rname})
    print("เพิ่มชื่อนักเรียนสำเร็จ")

def delete_student():
    pid = input("กรอกรหัสที่ต้องการลบ: ")
    for p in student:
        if p['id'] == pid:
            student.remove(p)
            print("ลบสินค้ารสำเร็จ")
            return
    print("ไม่พบนักเรียน")

def update_student_Rname():
    pid = input("กรอกรหัสนักเรียนที่ต้องการอัปเดต: ")
    for p in student:
        if p['id'] == pid:
            while True:
             new_Rname = (input(f"ชื่อจริงใหม่ของ {p['Name']}: "))
             if new_Rname.split():
              p['Rname'] = new_Rname
              print("อัปเดตเรียบร้อย")
              return
             else:
                 print("text only")
    print("ไม่พบนักเรียน")

def search_student():
    keyword = input("ค้นหาด้วยชื่อหรือรหัส: ")
    found = False
    for p in student:
        if keyword.lower() in p['Name'].lower() or keyword in p['id']:
            print(f"{p['id']} | {p['Name']:8} | ชื่อจริง: {p['Rname']} ")
            found = True
    if not found:
        print("ไม่พบนักเรียนที่ค้นหา")

# เริ่มเมนูหลัก
while True:
    show_menu()
    choice = input("เลือกเมนู (1-6): ")

    if choice == '1':
        show_student()
    elif choice == '2':
        add_student()
    elif choice == '3':
        delete_student()
    elif choice == '4':
        update_student_Rname()
    elif choice == '5':
        search_student()
    elif choice == '6':
        print("ออกโปรแกรมแล้ว")
        break
    else:
        print("กรุณาเลือกแค่ 1-6")
