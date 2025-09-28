// เปิดกระเป๋าเปลี่ยน icon
const backpack = document.getElementById("backpack");
const iconOutline = document.getElementById("icon-outline");
const iconFill = document.getElementById("icon-fill");
const containerInventory = document.querySelector(".container-inventory");

backpack.addEventListener("click", (e) => {
  e.preventDefault();

  // toggle icon
  iconOutline.classList.toggle("active");
  iconFill.classList.toggle("active");

  // toggle container
  containerInventory.classList.toggle("active");
});


// เปิดกล้องมาใช้
const video = document.getElementById('camera');

navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("ไม่สามารถเปิดกล้อง:", err);
  });


// ปุ่ม inventory
const buttons = document.querySelectorAll(".inventory-btt a i");
const page1 = document.querySelector(".inventory-page1");
const page2 = document.querySelector(".inventory-page2");

buttons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    // ลบ active ทุกปุ่ม
    buttons.forEach(b => b.classList.remove("active"));
    // set active ปุ่มที่กด
    btn.classList.add("active");

    // ซ่อน/โชว์หน้า
    if (index === 0) {
      page1.style.display = "block";
      page2.style.display = "none";
    } else if (index === 1) {
      page1.style.display = "none";
      page2.style.display = "block";
    }
  });
});



/*popup*/
/*popup save as student*/
function open_save_as_std(student_id, full_name) {
  document.getElementById("popup-student-id").value = student_id;
  document.getElementById("popup-student-name").value = full_name;

  document.getElementById("popup-edit-std").style.display = "flex";
}
function close_save_as_std() {
  document.getElementById("popup-edit-std").style.display = "none";
}

/*save*/
async function saveStudent() {
  const studentId = document.getElementById("popup-student-id").value;
  const fullName = document.getElementById("popup-student-name").value;

  await fetch(`${API_URL}/students/update?student_id=${studentId}&full_name=${encodeURIComponent(fullName)}`, {
    method: "PUT"
  });

  // โหลดข้อมูลใหม่
  loadStudents();
  close_save_as_std();
}

/*delete*/
async function deleteStudent(studentId) {
  if (!confirm("คุณต้องการลบนักเรียนคนนี้จริงหรือไม่?")) return;

  
    const response = await fetch(`${API_URL}/students/delete/${studentId}`, {
      method: "DELETE"
    });

    loadStudents(); 
    
  
}


/*popup save as check in check out*/
function open_save_as_time(attendance_id) {
  // หา row ที่กด
  const row = document.getElementById(`attendance-row-${attendance_id}`);
  if (!row) return;

  // ดึงค่า <p> ทั้งหมด
  const cols = row.querySelectorAll("p");
  const attendanceId = cols[0].innerText;
  const studentId = cols[1].innerText;
  const attendanceDate = cols[2].innerText;
  const checkinTime = cols[3].innerText;
  const checkoutTime = cols[4].innerText;

  // ใส่ค่าใน popup
  document.getElementById("popup-student-id-time").value = studentId;
  document.getElementById("popup-attendance-date").value = attendanceDate;
  document.getElementById("popup-checkin").value = checkinTime !== "-" ? checkinTime : "";
  document.getElementById("popup-checkout").value = checkoutTime !== "-" ? checkoutTime : "";

  // เปิด popup
  document.getElementById("popup-edit-time").style.display = "flex";
}

function close_save_as_time() {
  document.getElementById("popup-edit-time").style.display = "none";
}

async function saveAttendance() {
  const studentId = document.getElementById("popup-student-id-time").value;
  const attendanceDate = document.getElementById("popup-attendance-date").value;
  const checkin = document.getElementById("popup-checkin").value;
  const checkout = document.getElementById("popup-checkout").value;

  
   await fetch(
      `${API_URL}/attendance/update?student_id=${encodeURIComponent(studentId)}&attendance_date=${encodeURIComponent(attendanceDate)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`,
      { method: "PUT" }
    );

    loadAttendance();
    close_save_as_time();
  
  }

  async function deleteAttendance(attendanceId) {
  if (!confirm("คุณต้องการลบข้อมูลการเข้าออกนี้จริงหรือไม่?")) return;

  
    const response = await fetch(`${API_URL}/attendance/delete/${attendanceId}`, {
      method: "DELETE"
    });

    
    
    loadAttendance(); // รีโหลดตารางใหม่
    
  
}

async function deleteAttendance(attendanceId) {
  if (!confirm("คุณแน่ใจว่าจะลบข้อมูลนี้?")) return;

  
    await fetch(`${API_URL}/attendance/delete/${attendanceId}`, {
      method: "DELETE",
    });
    
    loadAttendance() // รีโหลดตารางใหม่
}


/*popup add student */
function open_add_std() {
  document.getElementById("popup-add-std").style.display = "flex";
}

function close_add_std() {
  document.getElementById("popup-add-std").style.display = "none";
}
/*popup add check in check out */
function open_add_time() {
  document.getElementById("popup-add-time").style.display = "flex";
}

function close_add_time() {
  document.getElementById("popup-add-time").style.display = "none";
}


/* API LOAD DATA*/
const API_URL = "http://127.0.0.1:8000"; 

/* โหลด Student */
async function loadStudents() {
  try {
    const response = await fetch(`${API_URL}/students`);
    const students = await response.json();

    const tableContainer = document.getElementById("student-container");
    tableContainer.innerHTML = ""; // ล้างก่อน

    students.forEach(std => {
      const row = document.createElement("div");
      row.classList.add("table-row");
      row.id = `student-row-${std.student_id}`;  // ✅ id เฉพาะ

      row.innerHTML = `
        <p>${std.student_id}</p>
        <p>${std.full_name}</p>
        <p>
          <button><span class="material-symbols-outlined">search</span></button>
          <button onclick="open_save_as_std('${std.student_id}', '${std.full_name}')">
            <span class="material-symbols-outlined">save_as</span>
          </button>
          <button onclick="deleteStudent(${std.student_id})">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </p>
      `;

      tableContainer.appendChild(row);
    });
  } catch (err) {
    console.error("โหลดข้อมูลนักเรียนล้มเหลว ❌", err);
  }
}

/*โหลด Attendance*/
// โหลดข้อมูล Attendance
async function loadAttendance() {
  try {
    const response = await fetch(`${API_URL}/attendance`);
    const attendanceList = await response.json();

    const container = document.getElementById("attendance");
    container.innerHTML = ""; // ล้างก่อน

    attendanceList.forEach(item => {
      const row = document.createElement("div");
      row.classList.add("table-row");
      row.id = `attendance-row-${item.attendance_id}`;

      row.innerHTML = `
        <p>${item.attendance_id}</p>
        <p>${item.student_id}</p>
        <p>${item.attendance_date}</p>
        <p>${item.checkin_time || "-"}</p>
        <p>${item.checkout_time || "-"}</p>
        <p>
          <button onclick="open_save_as_time(${item.attendance_id})">
            <span class="material-symbols-outlined">save_as</span>
          </button>
          <button onclick="deleteAttendance(${item.attendance_id})">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </p>
      `;

      container.appendChild(row);
    });
  } catch (err) {
    console.error("โหลดข้อมูล attendance ล้มเหลว ❌", err);
  }
}


window.onload = () => {
  loadStudents();    // โหลดตารางนักเรียน
  loadAttendance();  // โหลดตารางการเข้าออก
};