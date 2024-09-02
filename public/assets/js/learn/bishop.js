// import Swal from "sweetalert2";
var board3 = null;
var game3 = new Chess();
var moveSound3 = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var bishopMove = document.getElementById("bishopMove");
var allowed3 = true;

function removeRedSquares3(square) {
  var $square = $("#board3 .square-" + square);
  $square.css("background", "");
}

function redSquare3(square) {
  var $square = $("#board3 .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function getKeyByValue3(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus3() {
  var status = "";

  var moveColor = "White";
  if (game3.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game3.in_checkmate()) {
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game3.turn() + "K";
    // check?
    if (game3.in_check()) {
      let kingPosition = getKeyByValue3(board3.position(), king);
      redSquare3(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: false,
  position: {
    e4: "wB",
  },
};
board3 = Chessboard("board3", config);

updateStatus3();

bishopMove.addEventListener("click", () => {
  if (allowed3 == false) return;
  allowed3 = false;
  redSquare3("a8");
  redSquare3("b7");
  redSquare3("c6");
  redSquare3("d5");
  redSquare3("f3");
  redSquare3("g2");
  redSquare3("h1");
  redSquare3("d3");
  redSquare3("c2");
  redSquare3("b1");
  redSquare3("f5");
  redSquare3("g6");
  redSquare3("h7");
  board3.move("e4-a8");
  setTimeout(() => {
    board3.move("a8-e4");
    setTimeout(() => {
      board3.move("e4-h1");
      setTimeout(() => {
        board3.move("h1-e4");
        setTimeout(() => {
          board3.move("e4-b1");
          setTimeout(() => {
            board3.move("b1-e4");
            setTimeout(() => {
              board3.move("e4-h7");
              setTimeout(() => {
                board3.move("h7-e4");
                removeRedSquares3("a8");
                removeRedSquares3("b7");
                removeRedSquares3("c6");
                removeRedSquares3("d5");
                removeRedSquares3("f3");
                removeRedSquares3("g2");
                removeRedSquares3("h1");
                removeRedSquares3("d3");
                removeRedSquares3("c2");
                removeRedSquares3("b1");
                removeRedSquares3("f5");
                removeRedSquares3("g6");
                removeRedSquares3("h7");
                allowed3 = true;
              }, 750);
            }, 750);
          }, 750);
        }, 750);
      }, 750);
    }, 750);
  }, 750);
});
