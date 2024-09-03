let alert = document.querySelector(".flash");

window.addEventListener("load", () => {
  if (alert) {
    let i = -490;
    let id = setInterval(() => {
      alert.style.right = `${i}px`;
      if (i < 0) i += 10;
      else clearInterval(id);
    }, 5);
  }
  setTimeout(() => {
    $(".flash").alert("close");
  }, 2000);
});
