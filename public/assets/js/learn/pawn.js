// import Swal from "sweetalert2";
var board1 = null;
var game1 = new Chess();
var moveSound1 = new Audio("./assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var singleMove = document.getElementById("singleMove");
var doubleMove = document.getElementById("doubleMove");
var enPassant = document.getElementById("enPassant");
var promotion = document.getElementById("promotion");

function removeRedSquares1() {
  $("#board1 .square-55d63").css("background", "");
}

function redSquare1(square) {
  var $square = $("#board1 .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function getKeyByValue1(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateStatus1() {
  var status = "";

  var moveColor = "White";
  if (game1.turn() === "b") {
    moveColor = "Black";
  }

  // checkmate?
  if (game1.in_checkmate()) {
  }

  // game still on
  else {
    status = moveColor + " to move";
    let king = game1.turn() + "K";
    // check?
    if (game1.in_check()) {
      let kingPosition = getKeyByValue1(board1.position(), king);
      redSquare1(kingPosition);
      status += ", " + moveColor + " is in check";
    } else {
    }
  }
}

var config = {
  draggable: false,
  position: {
    c2: "wP",
    d2: "wP",
    e7: "bP",
    f5: "wP",
    h7: "wP",
  },
};
board1 = Chessboard("board1", config);
updateStatus1();

singleMove.addEventListener("click", () => {
  board1.move("c2-c3");
  setTimeout(() => {
    board1.position({
      c2: "wP",
      d2: "wP",
      e7: "bP",
      f5: "wP",
      h7: "wP",
    });
  }, 500);
});
doubleMove.addEventListener("click", () => {
  board1.move("d2-d4");
  setTimeout(() => {
    board1.position({
      c2: "wP",
      d2: "wP",
      e7: "bP",
      f5: "wP",
      h7: "wP",
    });
  }, 500);
});
enPassant.addEventListener("click", () => {
  board1.move("e7-e5");
  setTimeout(() => {
    board1.move("f5-e6");
    board1.position({
      c2: "wP",
      d2: "wP",
      e6: "wP",
      h7: "wP",
    });
    setTimeout(() => {
      board1.position({
        c2: "wP",
        d2: "wP",
        e7: "bP",
        f5: "wP",
        h7: "wP",
      });
    }, 750);
  }, 500);
});
promotion.addEventListener("click", () => {
  board1.move("h7-h8");
  board1.position({
    c2: "wP",
    d2: "wP",
    e7: "bP",
    f5: "wP",
    h8: "wQ",
  });
  setTimeout(() => {
    board1.position({
      c2: "wP",
      d2: "wP",
      e7: "bP",
      f5: "wP",
      h7: "wP",
    });
  }, 750);
});
