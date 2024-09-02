// import Swal from "sweetalert2";
var board6 = null;
var game6 = new Chess();
var moveSound6 = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var kingMove = document.getElementById("kingMove");
var kingSideCastle = document.getElementById("kingSideCastle");
var queenSideCastle = document.getElementById("queenSideCastle");
var allowed6 = true;

function removeRedSquares6(square) {
  var $square = $("#board6 .square-" + square);
  $square.css("background", "");
}

function redSquare6(square) {
  var $square = $("#board6 .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function getKeyByValue6(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus6() {
  var status = "";

  var moveColor = "White";
  if (game6.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game6.in_checkmate()) {
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game6.turn() + "K";
    // check?
    if (game6.in_check()) {
      let kingPosition = getKeyByValue6(board6.position(), king);
      redSquare6(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: false,
  position: {
    d6: "bK",
    e1: "wK",
    a1: "wR",
    h1: "wR",
  },
};
board6 = Chessboard("board6", config);

updateStatus6();

kingSideCastle.addEventListener("click", () => {
  board6.move("e1-g1");
  board6.move("h1-f1");
  setTimeout(() => {
    board6.position({
      d6: "bK",
      e1: "wK",
      a1: "wR",
      h1: "wR",
    });
  }, 750);
});

queenSideCastle.addEventListener("click", () => {
  board6.move("e1-c1");
  board6.move("a1-d1");
  setTimeout(() => {
    board6.position({
      d6: "bK",
      e1: "wK",
      a1: "wR",
      h1: "wR",
    });
  }, 750);
});

kingMove.addEventListener("click", () => {
  if (allowed6 == false) return;
  allowed6 = false;
  redSquare6("d7");
  redSquare6("d5");
  redSquare6("e7");
  redSquare6("e6");
  redSquare6("e5");
  redSquare6("c7");
  redSquare6("c6");
  redSquare6("c5");
  board6.move("d6-d7");
  setTimeout(() => {
    board6.move("d7-d6");
    setTimeout(() => {
      board6.move("d6-e7");
      setTimeout(() => {
        board6.move("e7-d6");
        setTimeout(() => {
          board6.move("d6-e6");
          setTimeout(() => {
            board6.move("e6-d6");
            setTimeout(() => {
              board6.move("d6-e5");
              setTimeout(() => {
                board6.move("e5-d6");
                setTimeout(() => {
                  board6.move("d6-d5");
                  setTimeout(() => {
                    board6.move("d5-d6");
                    setTimeout(() => {
                      board6.move("d6-c5");
                      setTimeout(() => {
                        board6.move("c5-d6");
                        setTimeout(() => {
                          board6.move("d6-c6");
                          setTimeout(() => {
                            board6.move("c6-d6");
                            setTimeout(() => {
                              board6.move("d6-c7");
                              setTimeout(() => {
                                board6.move("c7-d6");
                                removeRedSquares6("d7");
                                removeRedSquares6("d5");
                                removeRedSquares6("e7");
                                removeRedSquares6("e6");
                                removeRedSquares6("e5");
                                removeRedSquares6("c7");
                                removeRedSquares6("c6");
                                removeRedSquares6("c5");
                                allowed6 = true;
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
