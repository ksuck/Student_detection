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


/*---------------- API URL-------------------------------- */
const API_URL = ""; 




// เปิดกล้องมาใช้
/*------------------------------- CAMERA ----------------------------------- */
const video = document.getElementById('camera');
const logDisplay = document.getElementById("system-log-display");
const toggleCamera = document.getElementById("toggle-camera");


let stream = null; // เก็บ stream ไว้เผื่อปิดทีหลัง

let countdown = 5;
let countdownId = null;

// ฟังก์ชันเพิ่ม log
function addLog(type, message) {
  const div = document.createElement("div");
  div.classList.add(type); // system-log-info / system-log-suscess
  div.innerHTML = `<b>system</b> <p>${message}</p>`;
  logDisplay.prepend(div);
}

// เปิดกล้อง
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
    console.log("🎥 กล้องทำงานแล้ว");
    
    startCountdown();  // ✅ เริ่มนับเมื่อกล้องพร้อม
  } catch (err) {
    console.error("❌ ไม่สามารถเปิดกล้อง:", err);
  }
}
// ฟังก์ชันปิดกล้อง
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop()); 
    video.srcObject = null;
    stream = null;
    console.log("🛑 ปิดกล้องแล้ว");
  }

  if (countdownId) {       // ✅ หยุดนับ
    clearInterval(countdownId);
    countdownId = null;
  }
}

// ฟังการเปลี่ยน toggle
toggleCamera.addEventListener("change", () => {
  if (toggleCamera.checked) {
    startCamera();
  } else {
    stopCamera();
  }
});
// ฟังก์ชันเริ่มนับถอยหลัง
function startCountdown() {
  countdown = 5;
  addLog("system-log-info", "เริ่มนับถอยหลัง...");
  countdownId = setInterval(() => {
    addLog("system-log-info", `(${countdown})`);
    countdown--;

    if (countdown < 0) {
      clearInterval(countdownId);
      countdownId = null;
      captureAndSend(); // ยิง API หลังนับครบ
    }
  }, 1000);
}

// ✅ ดึง frame จาก <video> ส่งไป API
async function captureAndSend() {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    console.warn("⏳ กล้องยังไม่พร้อม");
    startCountdown(); // ถ้ายังไม่พร้อม → เริ่มนับใหม่
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
  const formData = new FormData();
  formData.append("file", blob, "frame.jpg");

  try {
    const res = await fetch(`${API_URL}/detect_face`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (data.found === false) {
      addLog("system-log-info", "❌ ไม่พบใบหน้า");
    } else {
      addLog("system-log-suscess", `✅ เจอ ${data.name} (มั่นใจ ${data.confidence.toFixed(2)})`);

      // 🟢 toggle sun/moon
      const toggleDayNight = document.getElementById("toggle-day-night");
      const isCheckIn = !toggleDayNight.checked; // ☀️ sun = check-in, 🌙 moon = check-out

      // 🗓️ วันที่และเวลา
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const now = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

      // 🔍 หานักเรียนจากชื่อ
      const studentRes = await fetch(`${API_URL}/students/by-name?full_name=${encodeURIComponent(data.name)}`);
      const student = await studentRes.json();

      if (!student || !student.student_id) {
        addLog("system-log-warnig", `⚠️ ไม่พบนักเรียนชื่อ ${data.name} ในระบบ`);
        return;
      }

      // 🔎 เช็คการเข้าออกวันนี้
      const attRes = await fetch(`${API_URL}/attendance/by-date?student_id=${student.student_id}&date=${today}`);
      const att = await attRes.json();

      if (!att || att.error) {
        // 📌 ยังไม่มีข้อมูล → add ใหม่
        if (isCheckIn) {
          await fetch(`${API_URL}/attendance/add?student_id=${student.student_id}&attendance_date=${today}&checkin=${now}&checkout=`, { method: "POST" });
          addLog("system-log-suscess", `🟢 เพิ่ม Check-in เวลา ${now}`);
        } else {
          await fetch(`${API_URL}/attendance/add?student_id=${student.student_id}&attendance_date=${today}&checkin=&checkout=${now}`, { method: "POST" });
          addLog("system-log-suscess", `🔵 เพิ่ม Check-out เวลา ${now}`);
        }
      } else {
        // 📌 มีแล้ว → update
        if (isCheckIn) {
          if (!att.checkin_time) {
            await fetch(`${API_URL}/attendance/update?student_id=${student.student_id}&attendance_date=${today}&checkin=${now}&checkout=${att.checkout_time || ""}`, { method: "PUT" });
            addLog("system-log-suscess", `🟢 อัปเดต Check-in เวลา ${now}`);
          } else {
            addLog("system-log-warnig", `⚠️ มีข้อมูล Check-in แล้ว (${att.checkin_time})`);
          }
        } else {
          if (!att.checkout_time) {
            await fetch(`${API_URL}/attendance/update?student_id=${student.student_id}&attendance_date=${today}&checkin=${att.checkin_time || ""}&checkout=${now}`, { method: "PUT" });
            addLog("system-log-suscess", `🔵 อัปเดต Check-out เวลา ${now}`);
          } else {
            addLog("system-log-warnig", `⚠️ มีข้อมูล Check-out แล้ว (${att.checkout_time})`);
          }
        }
      }

      // โหลดใหม่ให้ตารางอัปเดต
      loadAttendance();
    }
  } catch (err) {
    console.error("API error:", err);
    addLog("system-log-info", "⚠️ API error");
  } finally {
    startCountdown(); // ไม่ว่าจะเจอหรือไม่ → เริ่มนับใหม่
  }
}
/*------------------------------- CAMERA ----------------------------------- */
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

// เพิ่มนักเรียน
async function saveNewStudent() {
  const studentId = document.getElementById("add-student-id").value;
  const fullName = document.getElementById("add-student-name").value;

  if (!studentId || !fullName) {
    alert("กรอกข้อมูลให้ครบก่อนบันทึก");
    return;
  }

  await fetch(`${API_URL}/students/add?student_id=${encodeURIComponent(studentId)}&full_name=${encodeURIComponent(fullName)}`, {
    method: "POST"
  });

  loadStudents(); // โหลดตารางใหม่
  close_add_std(); // ปิด popup
}

// เพิ่มการเข้า-ออก
async function saveNewAttendance() {
  const studentId = document.getElementById("add-student-id-time").value;
  const attendanceDate = document.getElementById("add-attendance-date").value;
  const checkin = document.getElementById("add-checkin").value;
  const checkout = document.getElementById("add-checkout").value;

  if (!studentId || !attendanceDate || !checkin) {
    alert("กรอกข้อมูลให้ครบก่อนบันทึก");
    return;
  }

  await fetch(`${API_URL}/attendance/add?student_id=${encodeURIComponent(studentId)}&attendance_date=${encodeURIComponent(attendanceDate)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`, {
    method: "POST"
  });

  loadAttendance(); // โหลดตารางใหม่
  close_add_time(); // ปิด popup
}


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





