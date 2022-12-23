/***************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Variables   |   |   |   |   |   |   |   |   |
***************************************************************************************/
var darkBrown = "#795548";
var lightBrown = "#efdcd5";
var board = document.getElementById("chessBoard");
var body = document.getElementById("body");
var pieceNames = ["bishop", "king", "knight", "pawn", "queen", "rook"];
var pieces = [];
var squares = new Map();
var images = new Map();
var transparentSVG;
var selectedPieceLoc = null;
var currentLegalMoves = null;
var WHITE_KING = null;
var BLACK_KING = null;
var ROOM_ID = -1;
var GAME_TYPE = "OFFLINE";
var GAME_STARTED = false;
var PIECE_TYPE = "w";
var TURN = "w";

/* Online Variables */
var waitingForOpponent = true;

/*****************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Classes   |   |   |   |   |   |   |   |   |   |
*****************************************************************************************/
class Piece {
	constructor(name, location, image) {
		this.name = name;
		this.location = location;
		this.image = image;
		this.hasMoved = false;
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
					legalMoves.add(tempLoc);
					break;
				}
			}
		}

		legalMoves.delete(this.location);

		// If moving the piece causes the king to be under attack, delete that move.
		let actualLocation = this.location;
		let king = TURN === "w" ? WHITE_KING : BLACK_KING;

		legalMoves.forEach((move) => {
			let isRemoved = false;
			let pieceOnTheTargetLoc = getPieceByLoc(move);
			if (pieceOnTheTargetLoc !== null) {
				pieces.splice(pieces.indexOf(pieceOnTheTargetLoc), 1);
				isRemoved = true;
			}
			this.location = move;

			if (isKingUnderAttack(king.location, TURN === "w" ? "b" : "w")) {
				legalMoves.delete(move);
			}

			if (isRemoved) {
				pieces.push(pieceOnTheTargetLoc);
			}
		});

		this.location = actualLocation;

		return legalMoves;
	}

	getLegalAttacks() {
		let legalMoves = new Set();

		// Going north-east
		let tempLoc = this.location;
		while (!this.isOutsideOfBoard(tempLoc)) {
			legalMoves.add(tempLoc);
			tempLoc = getNextChar(tempLoc[0]) + "" + (parseInt(tempLoc[1]) - 1);

			let piece = getPieceByLoc(tempLoc);
			if (piece !== null) {
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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

				let place = this.name.startsWith("w") ? 8 : 1;

				let piece = getPieceByLoc("a" + place);

				if (piece === null || !piece.name.includes("rook")) {
					// If left rook has moved castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				if (piece.hasMoved) {
					// If left rook has moved castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				if (getPieceByLoc("b" + place) !== null || getPieceByLoc("c" + place) !== null || getPieceByLoc("d" + place) !== null) {
					// If there are pieces between king and rook is under attack, castle is impossible
					legalMoves.delete(loc);
					continue;
				}
				let enemyType = TURN === "w" ? "b" : "w";
				if (isUnderAttackBy("b" + place, enemyType) || isUnderAttackBy("c" + place, enemyType) || isUnderAttackBy("d" + place, enemyType)) {
					// If the squares between king and rook is under attack, castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				if (isUnderAttackBy(this.location, enemyType)) {
					// If the king is under attack, castle is impossible
					legalMoves.delete(loc);
					continue;
				}
			} else if (loc == "RC") {
				if (this.hasMoved) {
					// If king has moved castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				let place = this.name.startsWith("w") ? 8 : 1;
				let piece = getPieceByLoc("h" + place);

				if (piece === null || !piece.name.includes("rook")) {
					// If left rook has moved castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				if (piece.hasMoved) {
					// If left rook has moved castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				if (getPieceByLoc("f" + place) !== null || getPieceByLoc("g" + place) !== null) {
					// If there are pieces between king and rook is under attack castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				let enemyType = TURN === "w" ? "b" : "w";
				if (isUnderAttackBy("f" + place, enemyType) || isUnderAttackBy("g" + place, enemyType)) {
					// If the squares between king and rook is under attack castle is impossible
					legalMoves.delete(loc);
					continue;
				}

				if (isUnderAttackBy(this.location, enemyType)) {
					// If the king is under attack castle is impossible
					legalMoves.delete(loc);
					continue;
				}
			} else {
				let piece = getPieceByLoc(loc);
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					legalMoves.delete(loc);
					continue;
				}

				// Get enemy king
				let enemyKing = this.name.startsWith("w") ? BLACK_KING : WHITE_KING;

				// Check if enemy king is near our king in this move
				if (isNear(enemyKing.location, loc)) {
					legalMoves.delete(loc);
					continue;
				}

				let enemyType = TURN === "w" ? "b" : "w";
				if (isUnderAttackBy(loc, enemyType)) {
					legalMoves.delete(loc);
					continue;
				}
			}
		}

		return legalMoves;
	}

	getLegalAttacks() {
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

		// Remove impossible moves
		for (const loc of legalMoves) {
			if (this.isOutsideOfBoard(loc)) {
				legalMoves.delete(loc);
				continue;
			}

			let piece = getPieceByLoc(loc);
			if (piece !== null && piece.name.startsWith(this.name[0])) {
				// There is a friendly piece on the target location
				legalMoves.delete(loc);
				continue;
			}

			// Get enemy king
			let enemyKing = this.name.startsWith("w") ? BLACK_KING : WHITE_KING;

			// Check if enemy king is near our king in this move
			if (isNear(enemyKing.location, loc)) {
				legalMoves.delete(loc);
				continue;
			}

			let enemyType = TURN === "w" ? "b" : "w";
			if (isKingUnderAttack(loc, enemyType)) {
				legalMoves.delete(loc);
				continue;
			}
		}

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
			if (piece !== null && piece.name.startsWith(this.name[0])) {
				// There is a friendly piece on the target location
				legalMoves.delete(loc);
				continue;
			}

			if (this.isOutsideOfBoard(loc)) {
				legalMoves.delete(loc);
				continue;
			}
		}

		legalMoves.delete(this.location);

		// If moving the piece causes the king to be under attack, delete that move.
		let actualLocation = this.location;
		let king = TURN === "w" ? WHITE_KING : BLACK_KING;

		legalMoves.forEach((move) => {
			let isRemoved = false;
			let pieceOnTheTargetLoc = getPieceByLoc(move);
			if (pieceOnTheTargetLoc !== null) {
				pieces.splice(pieces.indexOf(pieceOnTheTargetLoc), 1);
				isRemoved = true;
			}
			this.location = move;

			if (isKingUnderAttack(king.location, TURN === "w" ? "b" : "w")) {
				legalMoves.delete(move);
			}

			if (isRemoved) {
				pieces.push(pieceOnTheTargetLoc);
			}
		});

		this.location = actualLocation;

		return legalMoves;
	}

	getLegalAttacks() {
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
			if (piece !== null && piece.name.startsWith(this.name[0])) {
				// There is a friendly piece on the target location
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
	}

	getLegalMoves() {
		let legalMoves = new Set();

		let piece;
		let direction = this.name.startsWith("w") ? -1 : 1;

		// Add 4 possible move if it is legal
		piece = getPieceByLoc(this.location[0] + "" + (parseInt(this.location[1]) + direction * 1));
		if (piece === null) {
			legalMoves.add(this.location[0] + "" + (parseInt(this.location[1]) + direction * 1)); // Top

			piece = getPieceByLoc(this.location[0] + "" + (parseInt(this.location[1]) + direction * 2));
			if (!this.hasMoved && piece === null) {
				legalMoves.add(this.location[0] + "" + (parseInt(this.location[1]) + direction * 2)); // Top 2
			}
		}

		piece = getPieceByLoc(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1));
		if (piece !== null && !piece.name.startsWith(this.name[0])) {
			legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1)); // Top - Right
		}

		piece = getPieceByLoc(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1));
		if (piece !== null && !piece.name.startsWith(this.name[0])) {
			legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1)); // Top - Left
		}

		legalMoves.delete(this.location);

		// If moving the piece causes the king to be under attack, delete that move.
		let actualLocation = this.location;
		let king = TURN === "w" ? WHITE_KING : BLACK_KING;

		legalMoves.forEach((move) => {
			let isRemoved = false;
			let pieceOnTheTargetLoc = getPieceByLoc(move);
			if (pieceOnTheTargetLoc !== null) {
				pieces.splice(pieces.indexOf(pieceOnTheTargetLoc), 1);
				isRemoved = true;
			}
			this.location = move;

			if (isKingUnderAttack(king.location, TURN === "w" ? "b" : "w")) {
				legalMoves.delete(move);
			}

			if (isRemoved) {
				pieces.push(pieceOnTheTargetLoc);
			}
		});

		this.location = actualLocation;

		return legalMoves;
	}

	getLegalAttacks() {
		let legalMoves = new Set();

		let piece;
		let direction = this.name.startsWith("w") ? -1 : 1;

		piece = getPieceByLoc(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1));
		if (piece !== null && !piece.name.startsWith(this.name[0])) {
			legalMoves.add(getNextChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1)); // Top - Right
		}

		piece = getPieceByLoc(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1));
		if (piece !== null && !piece.name.startsWith(this.name[0])) {
			legalMoves.add(getPrevChar(this.location[0]) + "" + (parseInt(this.location[1]) + direction * 1)); // Top - Left
		}

		return legalMoves;
	}
}

class Rook extends Piece {
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
					legalMoves.add(tempLoc);
					break;
				}
			}
		}

		legalMoves.delete(this.location);

		// If moving the piece causes the king to be under attack, delete that move.
		let actualLocation = this.location;
		let king = TURN === "w" ? WHITE_KING : BLACK_KING;

		legalMoves.forEach((move) => {
			let isRemoved = false;
			let pieceOnTheTargetLoc = getPieceByLoc(move);
			if (pieceOnTheTargetLoc !== null) {
				pieces.splice(pieces.indexOf(pieceOnTheTargetLoc), 1);
				isRemoved = true;
			}
			this.location = move;

			if (isKingUnderAttack(king.location, TURN === "w" ? "b" : "w")) {
				legalMoves.delete(move);
			}

			if (isRemoved) {
				pieces.push(pieceOnTheTargetLoc);
			}
		});

		this.location = actualLocation;

		return legalMoves;
	}

	getLegalAttacks() {
		let legalMoves = new Set();

		// Going Up
		let tempLoc = this.location;
		while (!this.isOutsideOfBoard(tempLoc)) {
			legalMoves.add(tempLoc);
			tempLoc = tempLoc[0] + "" + (parseInt(tempLoc[1]) - 1);

			let piece = getPieceByLoc(tempLoc);
			if (piece !== null) {
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
					legalMoves.add(tempLoc);
					break;
				}
			}
		}

		legalMoves.delete(this.location);

		// If moving the piece causes the king to be under attack, delete that move.
		let actualLocation = this.location;
		let king = TURN === "w" ? WHITE_KING : BLACK_KING;

		legalMoves.forEach((move) => {
			let isRemoved = false;
			let pieceOnTheTargetLoc = getPieceByLoc(move);
			if (pieceOnTheTargetLoc !== null) {
				pieces.splice(pieces.indexOf(pieceOnTheTargetLoc), 1);
				isRemoved = true;
			}
			this.location = move;

			if (isKingUnderAttack(king.location, TURN === "w" ? "b" : "w")) {
				legalMoves.delete(move);
			}

			if (isRemoved) {
				pieces.push(pieceOnTheTargetLoc);
			}
		});

		this.location = actualLocation;

		return legalMoves;
	}

	getLegalAttacks() {
		let legalMoves = new Set();

		// Going Up
		let tempLoc = this.location;
		while (!this.isOutsideOfBoard(tempLoc)) {
			legalMoves.add(tempLoc);
			tempLoc = tempLoc[0] + "" + (parseInt(tempLoc[1]) - 1);

			let piece = getPieceByLoc(tempLoc);
			if (piece !== null) {
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
				if (piece !== null && piece.name.startsWith(this.name[0])) {
					// There is a friendly piece on the target location
					break;
				} else {
					// There is an enemy piece on the target location
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
function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function addChessSquares() {
	let rowNumber = 1;
	let columnNumber = "a";

	let is_mobile = isMobile();

	for (let x = 0; x < 8; x++, rowNumber++) {
		let row = document.createElement("div");
		row.className = is_mobile ? "rows_mobile" : "rows";
		board.appendChild(row);

		for (let y = 0; y < 8; y++, columnNumber = getNextChar(columnNumber)) {
			let square = document.createElement("img");
			square.className = is_mobile ? "squares_mobile" : "squares";
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
	WHITE_KING = new King("w_king", "e8", images.get("w_king"));
	pieces.push(new Rook("w_rook", "a8", images.get("w_rook")));
	pieces.push(new Rook("w_rook", "h8", images.get("w_rook")));
	pieces.push(new Queen("w_queen", "d8", images.get("w_queen")));
	pieces.push(new Knight("w_knight", "b8", images.get("w_knight")));
	pieces.push(new Knight("w_knight", "g8", images.get("w_knight")));
	pieces.push(WHITE_KING);
	pieces.push(new Bishop("w_bishop", "c8", images.get("w_bishop")));
	pieces.push(new Bishop("w_bishop", "f8", images.get("w_bishop")));
	for (let i = 0; i < 8; i++) {
		pieces.push(new Pawn("w_pawn", temp + "" + 7, images.get("w_pawn")));
		temp = getNextChar(temp);
	}

	// Black pieces
	temp = "a";
	BLACK_KING = new King("b_king", "e1", images.get("b_king"));
	pieces.push(new Rook("b_rook", "a1", images.get("b_rook")));
	pieces.push(new Rook("b_rook", "h1", images.get("b_rook")));
	pieces.push(new Queen("b_queen", "d1", images.get("b_queen")));
	pieces.push(new Knight("b_knight", "b1", images.get("b_knight")));
	pieces.push(new Knight("b_knight", "g1", images.get("b_knight")));
	pieces.push(BLACK_KING);
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
	if (loc2 === "LC") {
		// Left castle

		// Move the king 2 positions to the left
		let king = getPieceByLoc(loc1);
		let newLoc = getPrevChar(getPrevChar(king.location[0])) + "" + king.location[1];
		squares.get(newLoc).src = squares.get(loc1).src;
		king.location = newLoc;
		squares.get(loc1).src = transparentSVG.src;

		// Move the rook right to the king
		let rook = getPieceByLoc(getPrevChar(getPrevChar(king.location[0])) + "" + king.location[1]);
		let rookOldLoc = rook.location;
		newLoc = getNextChar(king.location[0]) + "" + king.location[1];
		squares.get(newLoc).src = squares.get(rook.location).src;
		rook.location = newLoc;
		squares.get(rookOldLoc).src = transparentSVG.src;
		return;
	} else if (loc2 === "RC") {
		// Right castle

		// Move the king 2 positions to the right
		let king = getPieceByLoc(loc1);
		let newLoc = getNextChar(getNextChar(king.location[0])) + "" + king.location[1];
		squares.get(newLoc).src = squares.get(loc1).src;
		king.location = newLoc;
		squares.get(loc1).src = transparentSVG.src;
		king.hasMoved = true;

		// Move the rook left to the king
		let rook = getPieceByLoc(getNextChar(king.location[0]) + "" + king.location[1]);
		let rookOldLoc = rook.location;
		newLoc = getPrevChar(king.location[0]) + "" + king.location[1];
		squares.get(newLoc).src = squares.get(rook.location).src;
		rook.location = newLoc;
		squares.get(rookOldLoc).src = transparentSVG.src;
		rook.hasMoved = true;
		return;
	}

	try {
		let targetPiece = getPieceByLoc(loc2);
		if (targetPiece !== null) {
			// There is a piece at the target location, eat the piece
			pieces.splice(pieces.indexOf(targetPiece), 1); // Remove target piece from pieces list
		}

		getPieceByLoc(loc1).hasMoved = true;
		getPieceByLoc(loc1).location = loc2;
		squares.get(loc2).src = squares.get(loc1).src;
		squares.get(loc1).src = transparentSVG.src;
	} catch (error) {
		console.log(error);
		console.log("loc1: ", loc1);
		console.log("loc2: ", loc2);
		console.log("piece1: ", getPieceByLoc(loc1));
		console.log("piece2: ", getPieceByLoc(loc2));
	}
}

function isNear(loc1, loc2) {
	// Add 8 possible move
	let loc1Letter = loc1[0].charCodeAt(0);
	let loc2Letter = loc2[0].charCodeAt(0);
	let loc1Number = loc1[1];
	let loc2Number = loc2[1];

	if ((Math.abs(loc1Letter - loc2Letter) == 0 || Math.abs(loc1Letter - loc2Letter) == 1) && (Math.abs(loc1Number - loc2Number) == 0 || Math.abs(loc1Number - loc2Number) == 1)) {
		return true;
	}

	return false;
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

function onlineChoiceAnimation() {
	delay(500).then(() => {
		document.getElementById("online_button").classList.add("startAnimButton");
		document.getElementById("offline_button").classList.add("startAnimButton");
	});
}

function roomChoiceAnimation() {
	delay(500).then(() => {
		document.getElementById("create_room").classList.add("startAnimButton");
		document.getElementById("enter_room").classList.add("startAnimButton");
		document.getElementById("input").classList.add("startAnimInput");
	});
}

function scrollToElement(element) {
	element.scrollIntoView({
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
			let loc = TURN === "b" ? "c1" : "c8";
			squares.get(loc).classList.add("highlight");
		} else if (loc === "RC") {
			// Right Castle
			let loc = TURN === "b" ? "g1" : "g8";
			squares.get(loc).classList.add("highlight");
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

function isUnderAttackBy(loc, type) {
	// Check all pieces of the opponent. If location is in the legal moves of them, location is under attack.
	let isPieceUnderAttack = false;
	if (type === "w") {
		pieces.forEach((piece) => {
			if (piece.name.startsWith("w")) {
				let piecesLegalMoves = piece.getLegalAttacks();
				if (piecesLegalMoves.has(loc)) {
					isPieceUnderAttack = true;
					return;
				}
			}
		});
	} else {
		// type -> "b"
		pieces.forEach((piece) => {
			if (piece.name.startsWith("b")) {
				let piecesLegalMoves = piece.getLegalAttacks();
				if (piecesLegalMoves.has(loc)) {
					isPieceUnderAttack = true;
					return;
				}
			}
		});
	}

	return isPieceUnderAttack;
}

function isKingUnderAttack(loc, type) {
	// Check all pieces of the opponent. If location is in the legal moves of them, location is under attack.
	let isPieceUnderAttack = false;
	if (type === "w") {
		pieces.forEach((piece) => {
			if (piece.name.startsWith("w") && !piece.name.includes("king")) {
				let piecesLegalMoves = piece.getLegalAttacks();
				if (piecesLegalMoves.has(loc)) {
					isPieceUnderAttack = true;
					return;
				}
			}
		});
	} else {
		// type -> "b"
		pieces.forEach((piece) => {
			if (piece.name.startsWith("b") && !piece.name.includes("king")) {
				let piecesLegalMoves = piece.getLegalAttacks();
				if (piecesLegalMoves.has(loc)) {
					isPieceUnderAttack = true;
					return;
				}
			}
		});
	}

	return isPieceUnderAttack;
}

function adjustForMobile() {
	board.className = "chessBoard_mobile";
	document.getElementById("first").className = "firstText_mobile";
	document.getElementById("second").className = "secondText_mobile";
	document.getElementById("startButton").className = "button_mobile";
}

function turnTable() {
	if (board.classList.contains("rotate")) {
		board.classList.remove("rotate");
		squares.forEach((square) => {
			square.classList.remove("rotate");
		});
	} else {
		board.classList.add("rotate");
		squares.forEach((square) => {
			square.classList.add("rotate");
		});
	}
}

function getLocFromCastle(castle) {
	if (castle === "LC") {
		return TURN === "w" ? "c8" : "c1";
	} else if (castle === "RC") {
		return TURN === "w" ? "g8" : "g1";
	} else {
		console.log("wtf!");
	}
}

function isCheckMate() {
	if (isKingUnderAttack(WHITE_KING.location, "b")) {
		// If white king is under attack

		// If there is a legal move, it isn't check mate
		let isThereMove = false;
		pieces.forEach((piece) => {
			if (piece.name.startsWith("w") && piece.getLegalMoves().size != 0) {
				isThereMove = true;
				return;
			}
		});

		if (isThereMove) {
			// There is a legal move, it isn't check mate
			return null;
		} else {
			// Black won!
			console.log("Black Won!");
			return "b";
		}
	} else if (isKingUnderAttack(BLACK_KING.location, "w")) {
		// If black king is under attack

		// If there is a legal move, it isn't check mate
		let isThereMove = false;
		pieces.forEach((piece) => {
			if (piece.name.startsWith("b") && piece.getLegalMoves().size != 0) {
				isThereMove = true;
				return;
			}
		});

		if (isThereMove) {
			// There is a legal move, it isn't check mate
			return null;
		} else {
			// White won!
			console.log("White Won!");
			return "w";
		}
	} else {
		// Nobody Won!
		return null;
	}
}

function gameOverPanel(winner) {
	let panel = document.createElement("div");
	body.appendChild(panel);
	panel.classList.add("gameOverPanel");
	panel.style.left = 0;
	panel.style.top = 0;
	delay(1).then(() => {
		panel.classList.add("blur");
	});

	delay(500).then(() => {
		let text = document.createElement("h1");
		text.innerText = winner === "w" ? "White Won!" : "Black Won!";
		text.classList.add("gameOverText");
		panel.appendChild(text);

		let button = document.createElement("button");
		button.innerText = "Play Again!";
		button.classList.add("gameOverButton");
		panel.appendChild(button);
		button.addEventListener("click", () => {
			location.reload();
		});

		delay(100).then(() => {
			text.classList.add("startAnimInput");
			button.classList.add("startAnimButton");
		});
	});
}

async function gameStartRequest() {
	let url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves`;

	const fetchData = {
		method: "POST",
	};

	let varData;

	await fetch(url, fetchData)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			varData = data;
		});

	let roomid = varData.id;

	const xhr = new XMLHttpRequest();
	url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves/${roomid}`;
	xhr.open("PUT", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	const data = {
		lastPlayed: "b",
		move: "firstMove",
		id: roomid,
	};

	xhr.onload = function () {
		if (this.status === 200) {
			console.log(this.response);
		}
	};

	xhr.send(JSON.stringify(data));

	return varData;
}

async function sendMoveToServer(move, roomid) {
	const xhr = new XMLHttpRequest();
	let url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves/${roomid}`;
	xhr.open("PUT", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	const data = {
		lastPlayed: PIECE_TYPE,
		move: move,
		id: roomid,
	};

	xhr.onload = function () {
		if (this.status === 200) {
			console.log(this.response);
		}
	};

	xhr.send(JSON.stringify(data));
}

async function getData(roomid) {
	let url = `https://639b473531877e43d6882dce.mockapi.io/isochess/moves/${roomid}`;

	const fetchData = {
		method: "GET",
	};

	let varData = null;

	await fetch(url, fetchData)
		.then((response) => response.json())
		.then((data) => (varData = data));
	return varData;
}

async function isTheOpponentMoved() {
	if (waitingForOpponent) {
		let roomData = await getData(ROOM_ID);

		if (roomData !== null && roomData.lastPlayed !== PIECE_TYPE) {
			// Opponent has moved
			waitingForOpponent = false;

			// Make his move on this table
			let loc1 = roomData.move[0] + "" + roomData.move[1];
			let loc2 = roomData.move[2] + "" + roomData.move[3];
			move(loc1, loc2);
			console.log("Opponent moved " + loc1 + " to " + loc2);

			// Make turn variable my turn
			TURN = PIECE_TYPE;

			// Check is game over
			let isMate = isCheckMate();
			if (isMate === "b" || isMate === "w") {
				gameOverPanel(isMate);
			}
		}
	} else {
		console.log("waiting...");
	}
}

/****************************************************************************************
|   |   |   |   |   |   |   |   |   |   JS Starts   |   |   |   |   |   |   |   |   |   |
****************************************************************************************/

window.addEventListener("load", async () => {
	if (isMobile()) {
		adjustForMobile();
	}
	startingAnimation();

	addChessSquares();
	await setImages();
	setPieces();
	placePieces();
});

window.addEventListener("resize", () => {
	if (GAME_STARTED) {
		scrollToElement(board);
	}
});

window.addEventListener("beforeunload", () => {
	window.scrollTo(0, 0);
});

board.addEventListener("click", async (event) => {
	let clickedLoc = event.target.id;
	let selectedPiece = getPieceByLoc(clickedLoc);
	console.log(clickedLoc, selectedPiece);

	removeHighlights();

	if (GAME_TYPE === "OFFLINE") {
		if (selectedPieceLoc === null) {
			if (selectedPiece !== null && selectedPiece.name.startsWith(TURN)) {
				currentLegalMoves = selectedPiece.getLegalMoves();
				highlightLegalMoves(currentLegalMoves);
				selectedPieceLoc = clickedLoc;
			} else {
				selectedPieceLoc = null;
			}
		} else {
			if (selectedPiece !== null && selectedPiece.name.startsWith(TURN)) {
				currentLegalMoves = selectedPiece.getLegalMoves();
				highlightLegalMoves(currentLegalMoves);
				selectedPieceLoc = clickedLoc;
			} else {
				if (currentLegalMoves.has(clickedLoc)) {
					move(selectedPieceLoc, clickedLoc);
				} else if (currentLegalMoves.has("LC") || currentLegalMoves.has("RC")) {
					if (clickedLoc === getLocFromCastle("LC")) {
						move(selectedPieceLoc, "LC");
					} else if (clickedLoc === getLocFromCastle("RC")) {
						move(selectedPieceLoc, "RC");
					}
				} else {
					selectedPieceLoc = null;
					return;
				}

				selectedPieceLoc = null;
				TURN = TURN === "w" ? "b" : "w";
				if (!isMobile()) {
					delay(350).then(turnTable());
					// https://youtu.be/XmLnHPx_q2A
				}
			}
		}
	} else {
		// GAME_TYPE -> ONLINE
		if (waitingForOpponent) {
			if (selectedPiece !== null && selectedPiece.name.startsWith(PIECE_TYPE)) {
				let currentLegalMoves = selectedPiece.getLegalMoves();
				highlightLegalMoves(currentLegalMoves);
			} else {
				return;
			}
		} else {
			// My turn
			if (selectedPieceLoc === null) {
				if (selectedPiece !== null && selectedPiece.name.startsWith(PIECE_TYPE)) {
					currentLegalMoves = selectedPiece.getLegalMoves();
					highlightLegalMoves(currentLegalMoves);
					selectedPieceLoc = clickedLoc;
				} else {
					selectedPieceLoc = null;
				}
			} else {
				if (selectedPiece !== null && selectedPiece.name.startsWith(PIECE_TYPE)) {
					currentLegalMoves = selectedPiece.getLegalMoves();
					highlightLegalMoves(currentLegalMoves);
					selectedPieceLoc = clickedLoc;
				} else {
					if (currentLegalMoves.has(clickedLoc)) {
						move(selectedPieceLoc, clickedLoc);
						await sendMoveToServer(selectedPieceLoc + "" + clickedLoc, ROOM_ID);
						waitingForOpponent = true;
						TURN = PIECE_TYPE === "w" ? "b" : "w";
					} else if (currentLegalMoves.has("LC") || currentLegalMoves.has("RC")) {
						if (clickedLoc === getLocFromCastle("LC")) {
							move(selectedPieceLoc, "LC");
							await sendMoveToServer(selectedPieceLoc + "LC", ROOM_ID);
							waitingForOpponent = true;
							TURN = PIECE_TYPE === "w" ? "b" : "w";
						} else if (clickedLoc === getLocFromCastle("RC")) {
							move(selectedPieceLoc, "RC");
							await sendMoveToServer(selectedPieceLoc + "RC", ROOM_ID);
							waitingForOpponent = true;
							TURN = PIECE_TYPE === "w" ? "b" : "w";
						}
					} else {
						selectedPieceLoc = null;
						return;
					}
					selectedPieceLoc = null;
				}
			}
		}
	}

	let isMate = isCheckMate();
	if (isMate === "b" || isMate === "w") {
		gameOverPanel(isMate);
	}
});

document.getElementById("startButton").addEventListener("click", () => {
	scrollToElement(document.getElementById("online_choice"));
	onlineChoiceAnimation();
});

document.getElementById("offline_button").addEventListener("click", () => {
	GAME_TYPE = "OFFLINE";
	scrollToElement(board);
});

document.getElementById("online_button").addEventListener("click", () => {
	GAME_TYPE = "ONLINE";
	scrollToElement(document.getElementById("room_choice"));
	roomChoiceAnimation();
});

document.getElementById("create_room").addEventListener("click", async () => {
	let roomData = await gameStartRequest();
	ROOM_ID = roomData.id;
	document.getElementById("room_id").innerText = "Room Id: " + ROOM_ID;
	PIECE_TYPE = "b";
	turnTable();
	scrollToElement(board);
	setInterval(isTheOpponentMoved, 3000);
});

document.getElementById("enter_room").addEventListener("click", async () => {
	let roomid = document.getElementById("input").value;

	let roomData = await getData(roomid);
	console.log(roomData);

	if (roomData.length == 0) {
		document.getElementById("input").style.borderBottom = "3px solid red";
		document.getElementById("input").style.color = "red";
		document.getElementById("input").value = "Room not found!";
	} else {
		ROOM_ID = roomData.id;
		PIECE_TYPE = "w";
		document.getElementById("room_id").innerText = "Room Id: " + ROOM_ID;
		scrollToElement(board);
		setInterval(isTheOpponentMoved, 3000);
		waitingForOpponent = false;
	}
});

if ("serviceWorker" in navigator) {
	window.addEventListener("load", function () {
		navigator.serviceWorker
			.register("/class_repo_advanced/serviceWorker.js")
			.then((res) => console.log("service worker registered", res))
			.catch((err) => console.log("service worker not registered", err));
	});
}
