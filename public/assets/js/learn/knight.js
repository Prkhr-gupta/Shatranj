// import Swal from "sweetalert2";
var board2 = null;
var game2 = new Chess();
var moveSound2 = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var knightMove = document.getElementById("knightMove");
var allowed2 = true;

function removeRedSquares2(square) {
  var $square = $("#board2 .square-" + square);
  $square.css("background", "");
}

function redSquare2(square) {
  var $square = $("#board2 .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd2() {
  board2.position(game2.fen());
}

function getKeyByValue2(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus2() {
  var status = "";

  var moveColor = "White";
  if (game2.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game2.in_checkmate()) {
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game2.turn() + "K";
    // check?
    if (game2.in_check()) {
      let kingPosition = getKeyByValue2(board2.position(), king);
      redSquare2(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: false,
  position: {
    e4: "wN",
  },
  onSnapEnd: onSnapEnd2,
};
board2 = Chessboard("board2", config);

updateStatus2();

knightMove.addEventListener("click", () => {
  if (allowed2 == false) return;
  allowed2 = false;
  redSquare2("d6");
  redSquare2("d2");
  redSquare2("f6");
  redSquare2("f2");
  redSquare2("c3");
  redSquare2("c5");
  redSquare2("g5");
  redSquare2("g3");
  board2.move("e4-d6");
  setTimeout(() => {
    board2.move("d6-e4");
    setTimeout(() => {
      board2.move("e4-f6");
      setTimeout(() => {
        board2.move("f6-e4");
        setTimeout(() => {
          board2.move("e4-g5");
          setTimeout(() => {
            board2.move("g5-e4");
            setTimeout(() => {
              board2.move("e4-g3");
              setTimeout(() => {
                board2.move("g3-e4");
                setTimeout(() => {
                  board2.move("e4-f2");
                  setTimeout(() => {
                    board2.move("f2-e4");
                    setTimeout(() => {
                      board2.move("e4-d2");
                      setTimeout(() => {
                        board2.move("d2-e4");
                        setTimeout(() => {
                          board2.move("e4-c3");
                          setTimeout(() => {
                            board2.move("c3-e4");
                            setTimeout(() => {
                              board2.move("e4-c5");
                              setTimeout(() => {
                                board2.move("c5-e4");
                                removeRedSquares2("d6");
                                removeRedSquares2("d2");
                                removeRedSquares2("f6");
                                removeRedSquares2("f2");
                                removeRedSquares2("c3");
                                removeRedSquares2("c5");
                                removeRedSquares2("g5");
                                removeRedSquares2("g3");
                                allowed2 = true;
                              }, 500);
                            }, 500);
                          }, 500);
                        }, 500);
                      }, 500);
                    }, 500);
                  }, 500);
                }, 500);
              }, 500);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }, 500);
});
