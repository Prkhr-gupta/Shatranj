import { openings } from "../opening.js";
var board = null;
var game = new Chess();
var $status = $("#status");
var $fen = $("#fen");
var $pgn = $("#pgn");
var moveSound = new Audio("/assets/sounds/move-self.mp3");
var captureSound = new Audio("../assets/sounds/capture.mp3");
var castleSound = new Audio("../assets/sounds/castle.mp3");
var gameEndSound = new Audio("../assets/sounds/game-end.webm");
var gameStartSound = new Audio("../assets/sounds/game-start.mp3");
var checkSound = new Audio("../assets/sounds/move-check.mp3");
var lowTimeSound = new Audio("../assets/sounds/tenseconds.mp3");
var promoteSound = new Audio("../assets/sounds/promote.mp3");
var notifySound = new Audio("../assets/sounds/notify.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var redSquareRed = "#ff0000";
var moveCnt = document.querySelector(".move");
var whiteMove = document.querySelector(".whiteMove");
var blackMove = document.querySelector(".blackMove");
var cnt = 1;
var currOp = "";
var opening = document.getElementById("opening");
var messageBody = document.querySelector(".moveTimeline");
var resetBtn = document.getElementById("reset");

resetBtn.addEventListener("click", () => {
  window.location.replace("/");
});

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
  if ($square.hasClass("black-3c85d")) {
    background = redSquareRed;
  }

  $square.css("background", background);
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for the side to move
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
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
  let currMove = game.history()[game.history().length - 1];
  let li = document.createElement("li");
  li.innerText = currMove;
  li.style.marginTop = "0.5rem";
  let color = ";";
  if (cnt % 2) color = "rgb(28, 28, 28)";
  li.style.backgroundColor = color;
  if (move.color == "w") {
    if (currOp == "") currOp = currMove;
    else currOp = currOp + " " + currMove;
    let liCnt = document.createElement("li");
    liCnt.innerText = cnt + ".";
    liCnt.style.marginTop = "0.5rem";
    liCnt.style.backgroundColor = color;
    moveCnt.appendChild(liCnt);
    whiteMove.appendChild(li);
  } else {
    currOp = currOp + " " + currMove;
    blackMove.appendChild(li);
    cnt++;
  }
  if (cnt <= 3) {
    for (let open of openings) {
      if (open.moves == currOp) {
        opening.innerText = open.name;
        break;
      }
    }
  }
  messageBody.scrollTop = messageBody.scrollHeight;

  moveSound.play();
  updateStatus();
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
  let endMessage = "";
  // checkmate?
  if (game.in_checkmate()) {
    status = "Game over, " + moveColor + " is in checkmate.";

    if (moveColor == "White") {
      endMessage = "Player 2 wins";
    } else {
      endMessage = "Player 1 wins";
    }
  } else if (game.insufficient_material()) {
    status = "Game over, drawn position";
    endMessage = "Draw by insufficient material";
  } else if (game.in_stalemate()) {
    status = "Game over, drawn position";
    endMessage = "Draw by stalemate";
  } else if (game.in_threefold_repetition()) {
    status = "Game over, drawn position";
    endMessage = "Draw by threefold repetition";
  } else if (game.in_draw()) {
    status = "Game over, drawn position";
    endMessage = "Draw";
  }
  // game still on
  else {
    status = moveColor + " to move";
    let king = game.turn() + "K";
    // check?
    if (game.in_check()) {
      checkSound.play();
      let kingPosition = getKeyByValue(board.position(), king);

      redSquare(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
      let history = game.history({ verbose: true });
      let lastMove = history[history.length - 1];
      let moveType = typeof lastMove === "undefined" ? "z" : lastMove.flags;

      if (moveType == "n" || moveType == "b") moveSound.play();
      else if (moveType == "e" || moveType == "c") captureSound.play();
      else if (moveType == "p") promoteSound.play();
      else if (moveType == "k" || moveType == "q") castleSound.play();
    }
  }
  if (endMessage != "") {
    gameEndSound.play();
    Toast.fire({
      icon: "info",
      title: endMessage,
    });
  }

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
