// import Swal from "sweetalert2";
var board = null;
var game = new Chess();
var $status = $("#status");
var $fen = $("#fen");
var $pgn = $("#pgn");
var moveSound = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var redSquareRed = "#ff0000";
var moveCnt = document.querySelector(".move");
var whiteMove = document.querySelector(".whiteMove");
var blackMove = document.querySelector(".blackMove");
var cnt = 1;
var messageBody = document.querySelector(".moveTimeline");
var player_color = "White";
var rematch = document.getElementById("rematch");
var resign = document.getElementById("resign");
var gameOver = false;

rematch.addEventListener("click", () => {
  window.location.replace("http://localhost:8080/computer");
});

resign.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    showCancelButton: true,
    confirmButtonText: "Resign",
    icon: "warning",
    width: "24rem",
    color: "#fff",
    background: "rgb(28, 28, 34)",
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonColor: "#fff",
    buttonsStyling: false,
    customClass: {
      confirmButton: "Swal-btn-resign",
      cancelButton: "Swal-btn-deny",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      gameOver = true;
      gameAlert("You Lost", "by resignation", "error");
    }
  });
});

window.addEventListener("load", () => {
  Swal.fire({
    title: "Play As?",
    showDenyButton: true,
    confirmButtonText: "White",
    denyButtonText: "Black",
    icon: "question",
    width: "24rem",
    color: "#fff",
    background: "rgb(28, 28, 34)",
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonColor: "#fff",
    denyButtonColor: "#000",
    buttonsStyling: false,
    customClass: {
      confirmButton: "Swal-btn-confirm",
      denyButton: "Swal-btn-deny",
    },
  }).then((result) => {
    if (!result.isConfirmed) {
      player_color = "Black";
      board.orientation("black");
      makeRandomMove();
    }
  });
});

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
  $("#myBoard .square-55d63").css("background", "");
}

function greySquare(square) {
  var $square = $("#myBoard .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function removeRedSquares() {
  $("#myBoard .square-55d63").css("background", "");
}

function redSquare(square) {
  var $square = $("#myBoard .square-" + square);

  var background = redSquareRed;

  $square.css("background", background);
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

function makeRandomMove() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  let turn = game.turn();

  game.move(possibleMoves[randomIdx]);
  let currMove = game.history()[game.history().length - 1];
  let li = document.createElement("li");
  li.innerText = currMove;
  li.style.marginTop = "0.5rem";
  let color = ";";
  if (cnt % 2) color = "rgb(28, 28, 28)";
  li.style.backgroundColor = color;

  if (turn === "w") {
    let liCnt = document.createElement("li");
    liCnt.innerText = cnt + ".";
    liCnt.style.marginTop = "0.5rem";
    liCnt.style.backgroundColor = color;
    moveCnt.appendChild(liCnt);
    whiteMove.appendChild(li);
  } else {
    blackMove.appendChild(li);
    cnt++;
  }
  messageBody.scrollTop = messageBody.scrollHeight;
  moveSound.play();
  board.position(game.fen());
  updateStatus();
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
  let currMove = game.history()[game.history().length - 1];
  let li = document.createElement("li");
  li.innerText = currMove;
  li.style.marginTop = "0.5rem";
  let color = ";";
  if (cnt % 2) color = "rgb(28, 28, 28)";
  li.style.backgroundColor = color;
  if (move.color === "w") {
    let liCnt = document.createElement("li");
    liCnt.innerText = cnt + ".";
    liCnt.style.marginTop = "0.5rem";
    liCnt.style.backgroundColor = color;
    moveCnt.appendChild(liCnt);
    whiteMove.appendChild(li);
  } else {
    blackMove.appendChild(li);
    cnt++;
  }
  messageBody.scrollTop = messageBody.scrollHeight;

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
  board.position(game.fen());
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
    status = "Game over, " + moveColor + " is in checkmate.";
    if (player_color == moveColor)
      gameAlert("You Lost", "by checkmate", "error");
    else gameAlert("You Won", "by checkmate", "success");
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
      let kingPosition = getKeyByValue(board.position(), king);
      redSquare(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }

  console.log(game.fen());
  $status.html(status);
  $fen.html(game.fen());
  $pgn.html(game.pgn());
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
board = Chessboard("myBoard", config);

updateStatus();
