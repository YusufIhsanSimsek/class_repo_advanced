// .
var classesToChange = ["body", "background_image", "panel", "seperator", "inner_panel", "link", "photo", "info", "link_2"];

window.addEventListener("load", () => {
    makeResponsive();
    scaleBackgroundImage();
});


function makeResponsive() {
  if (isMobile()) {
    classesToChange.forEach(elementsClassName => {
        let collection = document.getElementsByClassName(elementsClassName);
        while(collection.length != 0) {
            collection[0].className = elementsClassName + "_mobile";
        }
    });
  }
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function scaleBackgroundImage() {
    document.getElementById("background_image").style.transform = "scale(1.1)";
}
