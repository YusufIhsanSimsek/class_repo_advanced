// .
var classesToChange = ["body", "background_image", "panel", "seperator", "inner_panel", "link", "photo", "info"];
let classWorkDiv = document.getElementById("cw_div");
let homeWorkDiv = document.getElementById("hw_div");
let personalDiv = document.getElementById("personal_div");

window.addEventListener("resize", ()=>{
    let panel = document.getElementById("panel");
    if (window.innerWidth <= 1100) {
        panel.style.flexDirection = "column";
    } else {
        panel.style.flexDirection = "row";
    }
});

window.addEventListener("load", () => {
    makeResponsive();
    scaleBackgroundImage();
    homeWorkDiv.click();
});

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
