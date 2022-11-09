// .
var classesToChange = ["body", "background_image", "panel", "seperator", "inner_panel", "link", "photo", "info"];
let classWorkDiv = document.getElementById("cw_div");
let homeWorkDiv = document.getElementById("hw_div");
let personalDiv = document.getElementById("personal_div");

let divs = [classWorkDiv, homeWorkDiv, personalDiv];
divs.forEach((div) =>
  div.addEventListener("click", () => {
    divEvent(div.id);
  })
);

window.addEventListener("load", () => {
  makeResponsive();
  scaleBackgroundImage();
  homeWorkDiv.click();
});

function divEvent(id) {
  switch (id) {
    case "cw_div":
      divs.forEach((div) => {
        // remove previous animations
        div.style.transform = "";
        div.style.opacity = "1";
        div.style.cursor = "";
      });

      classWorkDiv.style.transform = "translateX(+115%)";

      homeWorkDiv.style.transform = "scale(0.8) translateX(+135%) perspective(1em) rotateY(0.2deg)";
      homeWorkDiv.style.opacity = "0.3";
      homeWorkDiv.style.cursor = "pointer";

      personalDiv.style.transform = "scale(0.4) translateX(+135%) perspective(1em) rotateY(0.4deg)";
      personalDiv.style.opacity = "0.1";
      personalDiv.style.cursor = "pointer";

      break;

    case "hw_div":
      divs.forEach((div) => {
        // remove previous animations
        div.style.transform = "";
        div.style.opacity = "1";
        div.style.cursor = "";
      });

      homeWorkDiv.style.transform = "translateX(0)";

      classWorkDiv.style.transform = "scale(0.8) translateX(0) perspective(1em) rotateY(-0.23deg)";
      classWorkDiv.style.opacity = "0.3";
      classWorkDiv.style.cursor = "pointer";

      personalDiv.style.transform = "scale(0.8) translateX(0) perspective(1em) rotateY(0.2deg)";
      personalDiv.style.opacity = "0.3";
      personalDiv.style.cursor = "pointer";

      break;

    case "personal_div":
      divs.forEach((div) => {
        // remove previous animations
        div.style.transform = "";
        div.style.opacity = "1";
        div.style.cursor = "";
      });

      personalDiv.style.transform = "translateX(-115%)";

      classWorkDiv.style.transform = "scale(0.4) translateX(-135%) perspective(1em) rotateY(-0.4deg)";
      classWorkDiv.style.opacity = "0.1";
      classWorkDiv.style.cursor = "pointer";

      homeWorkDiv.style.transform = "scale(0.8) translateX(-135%) perspective(1em) rotateY(-0.2deg)";
      homeWorkDiv.style.opacity = "0.3";
      homeWorkDiv.style.cursor = "pointer";

      break;

    default:
      console.log("wtf!");
      break;
  }
}

function makeResponsive() {
  if (isMobile()) {
    classesToChange.forEach((elementsClassName) => {
      let collection = document.getElementsByClassName(elementsClassName);
      while (collection.length != 0) {
        collection[0].className = elementsClassName + "_mobile";
      }
    });
  }
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function scaleBackgroundImage() {
  document.getElementById("background_image").style.transform = "scale(1.05)";
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
