// import Swal from "sweetalert2";
var board5 = null;
var game5 = new Chess();
var moveSound5 = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var queenMove = document.getElementById("queenMove");
var allowed5 = true;

function removeRedSquares5(square) {
  var $square = $("#board5 .square-" + square);
  $square.css("background", "");
}

function redSquare5(square) {
  var $square = $("#board5 .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function getKeyByValue5(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus5() {
  var status = "";

  var moveColor = "White";
  if (game5.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game5.in_checkmate()) {
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game5.turn() + "K";
    // check?
    if (game5.in_check()) {
      let kingPosition = getKeyByValue5(board5.position(), king);
      redSquare5(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: false,
  position: {
    e4: "wQ",
  },
};
board5 = Chessboard("board5", config);

updateStatus5();

queenMove.addEventListener("click", () => {
  if (allowed5 == false) return;
  allowed5 = false;
  redSquare5("a4");
  redSquare5("b4");
  redSquare5("c4");
  redSquare5("d4");
  redSquare5("f4");
  redSquare5("g4");
  redSquare5("h4");
  redSquare5("e3");
  redSquare5("e2");
  redSquare5("e1");
  redSquare5("e5");
  redSquare5("e6");
  redSquare5("e7");
  redSquare5("e8");
  redSquare5("d5");
  redSquare5("c6");
  redSquare5("b7");
  redSquare5("a8");
  redSquare5("f3");
  redSquare5("g2");
  redSquare5("h1");
  redSquare5("f5");
  redSquare5("g6");
  redSquare5("h7");
  redSquare5("d3");
  redSquare5("c2");
  redSquare5("b1");
  board5.move("e4-a4");
  setTimeout(() => {
    board5.move("a4-e4");
    setTimeout(() => {
      board5.move("e4-a8");
      setTimeout(() => {
        board5.move("a8-e4");
        setTimeout(() => {
          board5.move("e4-e8");
          setTimeout(() => {
            board5.move("e8-e4");
            setTimeout(() => {
              board5.move("e4-h7");
              setTimeout(() => {
                board5.move("h7-e4");
                setTimeout(() => {
                  board5.move("e4-h4");
                  setTimeout(() => {
                    board5.move("h4-e4");
                    setTimeout(() => {
                      board5.move("e4-h1");
                      setTimeout(() => {
                        board5.move("h1-e4");
                        setTimeout(() => {
                          board5.move("e4-e1");
                          setTimeout(() => {
                            board5.move("e1-e4");
                            setTimeout(() => {
                              board5.move("e4-b1");
                              setTimeout(() => {
                                board5.move("b1-e4");
                                setTimeout(() => {
                                  board5.move("e1-e4");
                                  removeRedSquares5("a4");
                                  removeRedSquares5("b4");
                                  removeRedSquares5("c4");
                                  removeRedSquares5("d4");
                                  removeRedSquares5("f4");
                                  removeRedSquares5("g4");
                                  removeRedSquares5("h4");
                                  removeRedSquares5("e3");
                                  removeRedSquares5("e2");
                                  removeRedSquares5("e1");
                                  removeRedSquares5("e5");
                                  removeRedSquares5("e6");
                                  removeRedSquares5("e7");
                                  removeRedSquares5("e8");
                                  removeRedSquares5("d5");
                                  removeRedSquares5("c6");
                                  removeRedSquares5("b7");
                                  removeRedSquares5("a8");
                                  removeRedSquares5("f3");
                                  removeRedSquares5("g2");
                                  removeRedSquares5("h1");
                                  removeRedSquares5("f5");
                                  removeRedSquares5("g6");
                                  removeRedSquares5("h7");
                                  removeRedSquares5("d3");
                                  removeRedSquares5("c2");
                                  removeRedSquares5("b1");
                                  allowed5 = true;
                                }, 750);
                              }, 750);
                            }, 750);
                          }, 750);
                        }, 750);
                      }, 750);
                    }, 750);
                  }, 750);
                }, 750);
              }, 750);
            }, 750);
          }, 750);
        }, 750);
      }, 750);
    }, 750);
  }, 750);
});
