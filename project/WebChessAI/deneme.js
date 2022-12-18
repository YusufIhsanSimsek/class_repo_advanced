async function getData(idd) {
    let url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves`;

    const fetchData = {
        method: "POST"
    };

    await fetch(url, fetchData)
        .then((response) => response.json())
        .then((data) => console.log(data));
}

async function getData2(id) {
    const xhr = new XMLHttpRequest();
    let url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves/${id}`;

    xhr.open("DELETE", url, true);

    xhr.onload = function () {
        if (this.status === 200) {
            console.log(this.response);
        }
    };

    xhr.send();
}

async function getData3(id) {
    const xhr = new XMLHttpRequest();
    let url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves/${id}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    const data = {
        roomid: 23532,
        move: "asdasdsadsad",
    };

    xhr.onload = function () {
        if (this.status === 200) {
            console.log(this.response);
        }
    };

    xhr.send(JSON.stringify(data));
}

getData(123);
