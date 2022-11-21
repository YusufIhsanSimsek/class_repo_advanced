
buttons = new Map();
buttons.set('start', document.getElementById("start"));
buttons.set('pause', document.getElementById("pause"));
buttons.set('stop', document.getElementById("stop"));
buttons.set('next', document.getElementById("next"));
buttons.set('prev', document.getElementById("prev"));

images = [];
canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
currentImageIndex = 0;
previousTime = 0;
inProgress = false;
FRAME = 40;

window.addEventListener("load", () => {
    addListenersToButtons();
    getSpriteImages();
    animate();
});

function addListenersToButtons() {
    buttons.forEach((x) => {
        x.addEventListener("click", (event) => {
            switch (event.target.id) {
                case "start":
                    if (!inProgress) {
                        inProgress = true;
                        animate();
                    }
                    buttons.get('start').disabled = true;
                    buttons.get('pause').disabled = false;
                    buttons.get('stop').disabled = false;
                    buttons.get('next').disabled = true;
                    buttons.get('prev').disabled = true;
                    break;
                case "pause":
                    inProgress = false;
                    buttons.get('start').disabled = false;
                    buttons.get('pause').disabled = true;
                    buttons.get('stop').disabled = true;
                    buttons.get('next').disabled = false;
                    buttons.get('prev').disabled = false;
                    break;
                case "stop":
                    inProgress = false;
                    currentImageIndex = 0;
                    window.cancelAnimationFrame(animate);
                    clearCanvas();
                    buttons.get('start').disabled = false;
                    buttons.get('pause').disabled = true;
                    buttons.get('stop').disabled = true;
                    buttons.get('next').disabled = true;
                    buttons.get('prev').disabled = true;
                    break;
                case "next":
                    currentImageIndex = currentImageIndex >= images.length - 1 ? 0 : currentImageIndex + 1;
                    drawImage(images[currentImageIndex]);
                    break;
                case "prev":
                    currentImageIndex = currentImageIndex <= 0 ? images.length - 1 : currentImageIndex - 1;
                    drawImage(images[currentImageIndex]);
                    break;
                default:
                    console.log("wtf!");
                    break;
            }
        });
    });
}

function animate() {
    if (!inProgress) {
        return;
    }

    if (new Date().getTime() - previousTime > FRAME) {
        currentImageIndex = currentImageIndex >= images.length - 1 ? 0 : currentImageIndex + 1;
        previousTime = new Date().getTime();
    }

    drawImage(images[currentImageIndex]);

    requestAnimationFrame(animate);
}

function drawImage(image) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - image.width) / 2, (canvas.height - image.height) / 2);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

async function getSpriteImages() {
    for (let i = 1; i < 15; i++) {
        let url = "Sprites/fire (" + i + ").png";

        let options = {
            method: "GET",
        };

        let response = await fetch(url, options);

        if (response.status === 200) {
            let imageBlob = await response.blob();
            let imageObjectURL = URL.createObjectURL(imageBlob);

            let image = document.createElement("img");
            image.src = imageObjectURL;

            images.push(image);
        } else {
            console.log("HTTP-Error: " + response.status);
        }
    }
}
