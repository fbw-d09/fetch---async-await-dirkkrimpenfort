const modal = document.getElementById("myModal");
let promiseOfModal = new Promise(function (resolve) {
    window.setTimeout(function () {
        resolve(modal)
    }, (1000 * 5));
});

 /* promiseOfModal.then(function(val) {
    console.log("User has been on the page for 5 seconds");
    val.style.display = "block";
}) */

const openModalAfterDelay = async function () {
    await promiseOfModal;
    console.log("User has been on the page for 5 seconds");
    modal.style.display = "block";
  };
  
  openModalAfterDelay();
  
  modal.addEventListener("click", (e) => {
    if (e.target.className === "close" || e.target.className === "modal") {
      modal.style.display = "none";
    }
  });