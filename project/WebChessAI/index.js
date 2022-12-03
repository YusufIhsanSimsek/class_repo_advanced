/***************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Variables   |   |   |   |   |   |   |   |   |
***************************************************************************************/
var darkBrown = "#3e2723";
var lightBrown = "#efdcd5";
var board = document.getElementById("chessBoard");
var pieceNames = ["bishop", "king", "knight", "pawn", "queen", "rook"];
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
        if (loc.length !== 2) {
            return true;
        }

        if (loc === "LC" || loc === "RC") {
            return false;
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
        let legalMoves = new Set();

        // Going north-east
        let tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);

            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going south-east
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) + 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going south-west
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) + 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going north-west
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        legalMoves.delete(this.location);
        return legalMoves;
    }
}

class King extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
        this.hasMoved = false;
    }

    getLegalMoves() {
        let legalMoves = new Set();

        // Add 8 possible move
        legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) - 1)); // Top - Right
        legalMoves.add(getNextChar(this.location[0]) + "" + this.location[1]); // Right
        legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) + 1)); // Bottom - Right
        legalMoves.add(this.location[0] + "" + (parseInt(this.location[1]) + 1)); // Bottom
        legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) + 1)); // Bottom - Left
        legalMoves.add(getPrevChar(this.location[0]) + "" + this.location[1]); // Left
        legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) - 1)); // Top - Left
        legalMoves.add(this.location[0] + "" + (parseInt(this.location[1]) - 1)); // Top

        // Castle possibilities
        legalMoves.add("LC"); // Left Castle
        legalMoves.add("RC"); // Right Castle

        // Remove impossible moves
        for (const loc of legalMoves) {
            if (this.isOutsideOfBoard(loc)) {
                legalMoves.delete(loc);
                continue;
            }

            if (loc == "LC") {
                if (this.hasMoved) {
                    // If king has moved castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                let piece = getPieceByLoc("a8");

                if (!(piece instanceof Rook)) {
                    // If left rook has moved castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (piece.hasMoved) {
                    // If left rook has moved castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (getPieceByLoc("b8") !== null || getPieceByLoc("c8") !== null || getPieceByLoc("d8") !== null) {
                    // If there are pieces between king and rook is under attack castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (isUnderAttack("b8") || isUnderAttack("c8") || isUnderAttack("d8")) {
                    // If the squares between king and rook is under attack castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (isUnderAttack(this.location)) {
                    // If the king is under attack castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }
            } else if (loc == "RC") {
                if (this.hasMoved) {
                    // If king has moved castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                let piece = getPieceByLoc("h8");

                if (!(piece instanceof Rook)) {
                    // If left rook has moved castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (piece.hasMoved) {
                    // If left rook has moved castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (getPieceByLoc("f8") !== null || getPieceByLoc("g8") !== null) {
                    // If there are pieces between king and rook is under attack castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (isUnderAttack("f8") || isUnderAttack("g8")) {
                    // If the squares between king and rook is under attack castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }

                if (isUnderAttack(this.location)) {
                    // If the king is under attack castle is impossible
                    legalMoves.delete(loc);
                    continue;
                }
            } else {
                let piece = getPieceByLoc(loc);
                if (piece !== null && piece.name.startsWith("w")) {
                    legalMoves.delete(loc);
                    continue;
                }

                if (isUnderAttack(loc)) {
                    legalMoves.delete(loc);
                    continue;
                }
            }
        }

        console.log(legalMoves);

        return legalMoves;
    }
}

class Knight extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {
        let legalMoves = new Set();

        // Add 8 possible move
        legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) - 2)); // Top - Right 1
        legalMoves.add(getNextChar(getNextChar(this.location[0])) + "" + (parseInt(this.location[1]) - 1)); // Top - Right 2
        legalMoves.add(getNextChar(getNextChar(this.location[0])) + "" + (parseInt(this.location[1]) + 1)); // Bottom - Right 1
        legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) + 2)); // Bottom - Right 2
        legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) + 2)); // Bottom - Left 1
        legalMoves.add(getPrevChar(getPrevChar(this.location[0])) + "" + (parseInt(this.location[1]) + 1)); // Bottom - Left 2
        legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) - 2)); // Top - Left 1
        legalMoves.add(getPrevChar(getPrevChar(this.location[0])) + "" + parseInt(this.location[1] - 1)); // Top - Left 2

        // Remove illegal moves
        for (const loc of legalMoves) {
            let piece = getPieceByLoc(loc);
            if (piece !== null && piece.name.startsWith("w")) {
                legalMoves.delete(loc);
                continue;
            }
            if (this.isOutsideOfBoard(loc)) {
                legalMoves.delete(loc);
                continue;
            }
        }

        return legalMoves;
    }
}

class Pawn extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
        this.hasMoved = false;
    }

    getLegalMoves() {
        let legalMoves = new Set();

        let piece;

        // Add 4 possible move if it is legal
        piece = getPieceByLoc(this.location[0] + "" + (parseInt(this.location[1]) - 2));
        if (!this.hasMoved && piece === null) {
            legalMoves.add(this.location[0] + "" + (parseInt(this.location[1]) - 2)); // Top 2
        }

        piece = getPieceByLoc(this.location[0] + "" + (parseInt(this.location[1]) - 1));
        if (piece === null) {
            legalMoves.add(this.location[0] + "" + (parseInt(this.location[1]) - 1)); // Top
        }

        piece = getPieceByLoc(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) - 1));
        if (piece !== null && piece.name.startsWith("b")) {
            legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) - 1)); // Top - Right
        }

        piece = getPieceByLoc(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) - 1));
        if (piece !== null && piece.name.startsWith("b")) {
            legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) - 1)); // Top - Left
        }

        return legalMoves;
    }
}

class Rook extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
        this.hasMoved = false;
    }

    getLegalMoves() {
        let legalMoves = new Set();

        // Going Up
        let tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = tempLoc[0] + "" + (parseInt(tempLoc[1]) - 1);

            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Right
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + tempLoc[1];
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Down
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = tempLoc[0] + "" + (parseInt(tempLoc[1]) + 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Left
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + tempLoc[1];
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        legalMoves.delete(this.location);

        return legalMoves;
    }
}

class Queen extends Piece {
    constructor(name, location, image) {
        super(name, location, image);
    }

    getLegalMoves() {
        let legalMoves = new Set();

        // Going Up
        let tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = tempLoc[0] + "" + (parseInt(tempLoc[1]) - 1);

            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Right
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + tempLoc[1];
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Down
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = tempLoc[0] + "" + (parseInt(tempLoc[1]) + 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Left
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + tempLoc[1];
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Top-Left
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);

            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Bottom-Right
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) + 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Bottom-Left
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) + 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        // Going Top-Left
        tempLoc = this.location;
        while (!this.isOutsideOfBoard(tempLoc)) {
            legalMoves.add(tempLoc);
            tempLoc = getPrevChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);
            let piece = getPieceByLoc(tempLoc);
            if (piece !== null) {
                if (piece.name.startsWith("w")) {
                    break;
                } else {
                    // There is a black piece on the target location
                    legalMoves.add(tempLoc);
                    break;
                }
            }
        }

        legalMoves.delete(this.location);

        return legalMoves;
    }
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
    // ADD CASTLE OPTION
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
    let tempPiece = null;
    pieces.forEach((piece) => {
        if (piece.location === loc) {
            tempPiece = piece;
            return;
        }
    });
    return tempPiece;
}

function highlightLegalMoves(legalMoves) {
    legalMoves.forEach((loc) => {
        if (loc === "LC") {
            // Left Castle
            squares.get("c8").classList.add("highlight");
        } else if (loc === "RC") {
            // Right Castle
            squares.get("g8").classList.add("highlight");
        } else {
            squares.get(loc).classList.add("highlight");
        }
    });
}

function removeHighlights() {
    squares.forEach((square) => {
        square.classList.remove("highlight");
    });
}

// BUNU YAZZZZZZZZZZZZZZZZZZZZZZZZZZ
function isUnderAttack(loc, color) {
    if (color === "w") {
        // check the white pieces for attack
    } else {
        // check the black pieces for attack
    }
    return false;
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function adjustForMobile() {
    board.className = "chessBoard_mobile";
    document.getElementById("first").className = "firstText_mobile";
    document.getElementById("second").className = "secondText_mobile";
    document.getElementById("startButton").className = "button_mobile"
    document.querySelectorAll(".squares").forEach((element) => {
        element.className = "squares_mobile";
    });
    document.querySelectorAll(".rows").forEach((element) => {
        element.className = "rows_mobile";
    });
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

    if (isMobile()) {
        adjustForMobile();
    }
});

window.addEventListener("resize", () => {
    scrollToTable();
});

window.addEventListener("click", (event) => {
    let parentClassName = document.getElementById(event.target.id).parentElement.className;
    if (parentClassName !== "rows" && parentClassName !== "rows_mobile") {
        // if the user clicked outside of the table
        console.log("ad");
        return;
    }

    if (selectedLocation === event.target.id) {
        // if the user clicked in the same place
        return;
    }

    removeHighlights();

    if (getPieceByLoc(event.target.id) === null) {
        // There is no piece in the clicked square
        if (selectedLocation === null) {
            return;
        } else {
            move(selectedLocation, event.target.id);
            selectedLocation = null;
            return;
        }
    } else {
        // There is a piece in the clicked square
        if (getPieceByLoc(event.target.id).name.startsWith("w")) {
            let legalMoves = getPieceByLoc(event.target.id).getLegalMoves();
            if (legalMoves !== undefined) {
                highlightLegalMoves(legalMoves);
            }
            selectedLocation = event.target.id;
            return;
        } else {
            // black piece clicked. if its in the legal moves then move the piece
        }
    }
});
