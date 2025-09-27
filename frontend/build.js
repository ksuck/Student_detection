const backpack = document.getElementById("backpack");
const iconOutline = document.getElementById("icon-outline");
const iconFill = document.getElementById("icon-fill");

backpack.addEventListener("click", (e) => {
  e.preventDefault();

  iconOutline.classList.toggle("active");
  iconFill.classList.toggle("active");
});