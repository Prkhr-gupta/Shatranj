// import Swal from "sweetalert2";
var board4 = null;
var game4 = new Chess();
var moveSound4 = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var rookMove = document.getElementById("rookMove");
var allowed4 = true;

function removeRedSquares4(square) {
  var $square = $("#board4 .square-" + square);
  $square.css("background", "");
}

function redSquare4(square) {
  var $square = $("#board4 .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function getKeyByValue4(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus4() {
  var status = "";

  var moveColor = "White";
  if (game4.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game4.in_checkmate()) {
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game4.turn() + "K";
    // check?
    if (game4.in_check()) {
      let kingPosition = getKeyByValue4(board4.position(), king);
      redSquare4(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: false,
  position: {
    e4: "wR",
  },
};
board4 = Chessboard("board4", config);

updateStatus4();

rookMove.addEventListener("click", () => {
  if (allowed4 == false) return;
  allowed4 = false;
  redSquare4("a4");
  redSquare4("b4");
  redSquare4("c4");
  redSquare4("d4");
  redSquare4("f4");
  redSquare4("g4");
  redSquare4("h4");
  redSquare4("e3");
  redSquare4("e2");
  redSquare4("e1");
  redSquare4("e5");
  redSquare4("e6");
  redSquare4("e7");
  redSquare4("e8");
  board4.move("e4-a4");
  setTimeout(() => {
    board4.move("a4-e4");
    setTimeout(() => {
      board4.move("e4-h4");
      setTimeout(() => {
        board4.move("h4-e4");
        setTimeout(() => {
          board4.move("e4-e8");
          setTimeout(() => {
            board4.move("e8-e4");
            setTimeout(() => {
              board4.move("e4-e1");
              setTimeout(() => {
                board4.move("e1-e4");
                removeRedSquares4("a4");
                removeRedSquares4("b4");
                removeRedSquares4("c4");
                removeRedSquares4("d4");
                removeRedSquares4("f4");
                removeRedSquares4("g4");
                removeRedSquares4("h4");
                removeRedSquares4("e3");
                removeRedSquares4("e2");
                removeRedSquares4("e1");
                removeRedSquares4("e5");
                removeRedSquares4("e6");
                removeRedSquares4("e7");
                removeRedSquares4("e8");
                allowed4 = true;
              }, 750);
            }, 750);
          }, 750);
        }, 750);
      }, 750);
    }, 750);
  }, 750);
});
