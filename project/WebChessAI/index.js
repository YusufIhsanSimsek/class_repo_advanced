/***************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Variables   |   |   |   |   |   |   |   |   |
***************************************************************************************/
var darkBrown = "#3e2723";
var lightBrown = "#efdcd5";
var board = document.getElementById("chessBoard");
var pieceNames = ["bishop", "king", "knight", "pawn", "queen", "rook"];
var boardState = [];
var pieces = [];
var squares = new Map();
var images = new Map();
var transparentSVG;
var selectedLocation = null;

/*****************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Classes   |   |   |   |   |   |   |   |   |   |
*****************************************************************************************/
class Piece {
    constructor(name, location, image) {
        this.name = name;
        this.location = location;
        this.image = image;
    }

    isOutsideOfBoard(loc) {
        if (loc.length != 2) {
            return true;
        }

        let row = loc[0];
        if (row > "h" || row < "a") {
            return true;
        }

        let column = parseInt(loc[1]);
        if (column > 8 || column < 1) {
            return true;
        }
        return false;
    }
}

class Bishop extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {
        let legalMoves = [];

        console.log(this.getAllMoves());
    }

    getAllMoves() {
        let allMoves = new Set();

        // Going north-east
        let tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            allMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);
        }

        // Going south-east
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            allMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) + 1);
        }

        // Going south-west
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            allMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) + 1);
        }

        // Going north-west
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            allMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);
        }

        return allMoves;
    }
}

class King extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {}
}

class Knight extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {}
}

class Pawn extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {}
}

class Queen extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {}
}

class Rook extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {}
}

/*****************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Methods   |   |   |   |   |   |   |   |   |   |
*****************************************************************************************/
async function addChessSquares() {
    let rowNumber = 1;
    let columnNumber = "a";

    for (let x = 0; x < 8; x++, rowNumber++) {
        let row = document.createElement("div");
        row.className = "rows";
        board.appendChild(row);

        for (let y = 0; y < 8; y++, columnNumber = getNextChar(columnNumber)) {
            let square = document.createElement("img");
            square.className = "squares";
            square.id = columnNumber + "" + rowNumber;
            square.style.backgroundColor = (x + y) % 2 == 0 ? lightBrown : darkBrown;
            row.appendChild(square);
            squares.set(square.id, square);
        }
        columnNumber = "a";
    }
}

async function setImages() {
    // White pieces
    for (let i = 0; i < 6; i++) {
        let url = "res/pieces/white_" + pieceNames[i] + ".svg";

        let options = {
            method: "GET",
        };

        let response = await fetch(url, options);

        if (response.status === 200) {
            let imageBlob = await response.blob();
            let imageObjectURL = URL.createObjectURL(imageBlob);

            let image = document.createElement("img");
            image.src = imageObjectURL;

            images.set("w_" + pieceNames[i], image);
        }
    }
    // Black pieces
    for (let i = 0; i < 6; i++) {
        let url = "res/pieces/black_" + pieceNames[i] + ".svg";

        let options = {
            method: "GET",
        };

        let response = await fetch(url, options);

        if (response.status === 200) {
            let imageBlob = await response.blob();
            let imageObjectURL = URL.createObjectURL(imageBlob);

            let image = document.createElement("img");
            image.src = imageObjectURL;

            images.set("b_" + pieceNames[i], image);
        }
    }
    // Transparen SVG
    let url = "res/transparent.svg";

    let options = {
        method: "GET",
    };

    let response = await fetch(url, options);

    if (response.status === 200) {
        let imageBlob = await response.blob();
        let imageObjectURL = URL.createObjectURL(imageBlob);

        let image = document.createElement("img");
        image.src = imageObjectURL;

        transparentSVG = image;
    }
}

async function setPieces() {
    // White pieces
    let temp = "a";
    pieces.push(new Rook("w_rook", "a8", images.get("w_rook")));
    pieces.push(new Rook("w_rook", "h8", images.get("w_rook")));
    pieces.push(new Queen("w_queen", "d8", images.get("w_queen")));
    pieces.push(new Knight("w_knight", "b8", images.get("w_knight")));
    pieces.push(new Knight("w_knight", "g8", images.get("w_knight")));
    pieces.push(new King("w_king", "e8", images.get("w_king")));
    pieces.push(new Bishop("w_bishop", "c8", images.get("w_bishop")));
    pieces.push(new Bishop("w_bishop", "f8", images.get("w_bishop")));
    for (let i = 0; i < 8; i++) {
        pieces.push(new Pawn("w_pawn", temp + "" + 7, images.get("w_pawn")));
        temp = getNextChar(temp);
    }

    // Black pieces
    temp = "a";
    pieces.push(new Rook("b_rook", "a1", images.get("b_rook")));
    pieces.push(new Rook("b_rook", "h1", images.get("b_rook")));
    pieces.push(new Queen("b_queen", "d1", images.get("b_queen")));
    pieces.push(new Knight("b_knight", "b1", images.get("b_knight")));
    pieces.push(new Knight("b_knight", "g1", images.get("b_knight")));
    pieces.push(new King("b_king", "e1", images.get("b_king")));
    pieces.push(new Bishop("b_bishop", "c1", images.get("b_bishop")));
    pieces.push(new Bishop("b_bishop", "f1", images.get("b_bishop")));
    for (let i = 0; i < 8; i++) {
        pieces.push(new Pawn("b_pawn", temp + "" + 2, images.get("b_pawn")));
        temp = getNextChar(temp);
    }
}

async function placePieces() {
    // Empty all squares
    squares.forEach((square) => {
        squares.get(square.id).src = transparentSVG.src;
    });

    // Place pieces
    pieces.forEach((piece) => {
        squares.get(piece.location).src = piece.image.src;
    });
}

function getNextChar(char) {
    return String.fromCharCode(char.charCodeAt(0) + 1);
}

function getPrevChar(char) {
    return String.fromCharCode(char.charCodeAt(0) - 1);
}

function move(loc1, loc2) {
    getPieceByLoc(loc1).location = loc2;
    squares.get(loc2).src = squares.get(loc1).src;
    squares.get(loc1).src = transparentSVG.src;
}

function startingAnimation() {
    delay(500).then(() => {
        document.getElementById("first").classList.add("startAnim");

        delay(1000).then(() => {
            document.getElementById("second").classList.add("startAnim");

            delay(1500).then(() => {
                document.getElementById("startButton").classList.add("startAnimButton");
            });
        });
    });
}

function scrollToTable() {
    document.getElementById("chessBoard").scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
    });
}

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function getPieceByLoc(loc) {
    let tempPiece;
    pieces.forEach((piece) => {
        if (piece.location === loc) {
            tempPiece = piece;
            return;
        }
    });
    return tempPiece;
}

/****************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Starts   |   |   |   |   |   |   |   |   |   |
****************************************************************************************/

window.addEventListener("load", async () => {
    startingAnimation();

    await addChessSquares();
    await setImages();
    setPieces();
    placePieces();
});

window.addEventListener("resize", ()=>{
    scrollToTable();
});

window.addEventListener("click", (event) => {
    if (document.getElementById(event.target.id).parentElement.className != "rows") {
        // if the user clicked outside of the table
        return;
    }

    if (selectedLocation === event.target.id) {
        // if the user clicked in the same place
        return;
    }

    if (selectedLocation === null) {
        selectedLocation = event.target.id;
    } else {
        move(selectedLocation, event.target.id);
        selectedLocation = null;
    }

    console.log(getPieceByLoc(event.target.id).getLegalMoves());
});


