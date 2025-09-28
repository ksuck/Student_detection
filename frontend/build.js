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