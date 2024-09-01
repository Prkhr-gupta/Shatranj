// import Swal from "sweetalert2";
var board1 = null;
var board2 = null;
var board3 = null;
var board4 = null;
var board5 = null;
var board6 = null;
var game1 = new Chess();
var game2 = new Chess();
var game3 = new Chess();
var game4 = new Chess();
var game5 = new Chess();
var game6 = new Chess();
var moveSound = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var redSquareRed = "#ff0000";
var gameOver = false;

function gameAlert(title, msg, icon) {
  Swal.fire({
    title: `${title}`,
    text: `${msg}`,
    showDenyButton: true,
    confirmButtonText: "Rematch",
    denyButtonText: "Cancel",
    icon: `${icon}`,
    width: "24rem",
    color: "#fff",
    background: "rgb(28, 28, 34)",
    buttonsStyling: false,
    customClass: {
      confirmButton: "Swal-btn-confirm",
      denyButton: "Swal-btn-deny",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.replace("http://localhost:8080/computer");
    } else {
      resign.style.display = "none";
    }
  });
}

function removeGreySquares() {
  for (let i = 1; i <= 6; i++) {
    let id = `board${i}`;
    $(`${id} .square-55d63`).css("background", "");
  }
}

function greySquare(square) {
  for (let i = 1; i <= 6; i++) {
    let id = `board${i}`;
    var $square = $(`${id} .square-` + square);
    var background = whiteSquareGrey;
    if ($square.hasClass("black-3c85d")) {
      background = blackSquareGrey;
    }
    $square.css("background", background);
  }
}

function removeRedSquares() {
  for (let i = 1; i <= 6; i++) {
    let id = `board${i}`;
    $(`${id}.square-55d63`).css("background", "");
  }
}

function redSquare(square) {
  for (let i = 1; i <= 6; i++) {
    let id = `board${i}`;
    var $square = $(`${id} .square-` + square);
    var background = redSquareRed;
    $square.css("background", background);
  }
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;
  if (gameOver) return false;

  // only pick up pieces for the side to move
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function makeRandomMove(id) {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  if (id == 1) {
    game1.move(possibleMoves[randomIdx]);
    board1.position(game.fen());
  }
  if (id == 2) {
    game2.move(possibleMoves[randomIdx]);
    board2.position(game.fen());
  }
  if (id == 3) {
    game3.move(possibleMoves[randomIdx]);
    board3.position(game.fen());
  }
  if (id == 4) {
    game4.move(possibleMoves[randomIdx]);
    board4.position(game.fen());
  }
  if (id == 5) {
    game5.move(possibleMoves[randomIdx]);
    board5.position(game.fen());
  }
  if (id == 6) {
    game6.move(possibleMoves[randomIdx]);
    board6.position(game.fen());
  }
}

function onDrop(source, target) {
  removeGreySquares();
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";

  moveSound.play();
  updateStatus();
  window.setTimeout(makeRandomMove, 500);
}

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board1.position(game.fen());
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus() {
  var status = "";

  var moveColor = "White";
  if (game.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game.in_checkmate()) {
  } else if (game.insufficient_material()) {
    status = "Game over, drawn position";
    gameAlert("Draw", "by insufficient material", "warning");
  } else if (game.in_stalemate()) {
    status = "Game over, drawn position";
    gameAlert("Draw", "by stalemate", "warning");
  } else if (game.in_threefold_repetition()) {
    status = "Game over, drawn position";
    gameAlert("Draw", "by threefold repetition", "warning");
  } else if (game.in_draw()) {
    status = "Game over, drawn position";
    gameAlert("Draw", "", "warning");
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game.turn() + "K";
    // check?
    if (game.in_check()) {
      let kingPosition = getKeyByValue(board1.position(), king);
      redSquare(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
board1 = Chessboard("board1", config);
board2 = Chessboard("board2", config);
board3 = Chessboard("board3", config);
board4 = Chessboard("board4", config);
board5 = Chessboard("board5", config);
board6 = Chessboard("board6", config);

updateStatus();
