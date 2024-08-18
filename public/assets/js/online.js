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
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const player_color = urlParams.get("color");
socket.emit("join room", roomId);
let gameHasStarted = false;
let gameOver = false;
var draw = document.getElementById("draw");
var rematch = document.getElementById("rematch");
var resign = document.getElementById("resign");

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
    gameOver = true;
    draw.style.display = "none";
    resign.style.display = "none";
    rematch.style.display = "inline-block";
    if (result.isConfirmed) {
      socket.emit("rematch", roomId);
    }
  });
}

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
      console.log("resigned");
      gameOver = true;
      socket.emit("resign", roomId);
      gameAlert("You Lost", "by resignation", "error");
    }
  });
});

draw.addEventListener("click", () => {
  socket.emit("draw", roomId);
});

rematch.addEventListener("click", () => {
  socket.emit("rematch", roomId);
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
  if (!gameHasStarted) return false;
  if (gameOver) return false;

  if (
    (player_color === "white" && piece.search(/^b/) !== -1) ||
    (player_color === "black" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }

  // only pick up pieces for the side to move
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function updateSidebar(move) {
  let currMove = game.history()[game.history().length - 1];
  let li = document.createElement("li");
  li.innerText = currMove;
  li.style.marginTop = "0.5rem";
  let color = "";
  if (cnt % 2) color = "rgb(28, 28, 28)";
  li.style.backgroundColor = color;
  if (move != null && move.color == "w") {
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
}

function onDrop(source, target) {
  removeGreySquares();
  // see if the move is legal
  var theMove = {
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  };

  var move = game.move(theMove);

  // illegal move
  if (move === null) return "snapback";
  updateSidebar(move);
  moveSound.play();
  socket.emit(
    "move",
    theMove,
    roomId,
    player_color,
    game.history({ verbose: true })
  );
  updateStatus();
}

socket.on("newMove", function (theMove, gameInfo) {
  let move = game.move(theMove);
  if (move === null) return;
  updateSidebar(move);
  board.position(game.fen());
  updateStatus();
});

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;
  // console.log(moves);
  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    if (player_color[0] == moves[i].color) greySquare(moves[i].to);
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
    if (player_color.toLocaleLowerCase() == moveColor.toLocaleLowerCase())
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
    }
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
if (player_color == "black") {
  board.orientation("black");
}

updateStatus();

socket.on("startGame", function (gameInfo) {
  gameHasStarted = true;
  let arr = gameInfo.history;
  for (let i = 0; i < arr.length; i++) {
    let str = `${arr[i].from}-${arr[i].to}`;
    board.move(str);
    let theMove = game.move({
      from: arr[i].from,
      to: arr[i].to,
      promotion: "q",
    });
    updateSidebar(theMove);
    updateStatus();
  }
});

socket.on("opp resigned", () => {
  gameAlert("You Won", "by resignation", "success");
});

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: true,
  showDenyButton: true,
  confirmButtonText: "Accept",
  denyButtonText: "Decline",
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  color: "#fff",
  background: "rgb(28, 28, 34)",
  buttonsStyling: false,
  customClass: {
    confirmButton: "Swal-btn-confirm",
    denyButton: "Swal-btn-deny",
  },
});

socket.on("draw offer", () => {
  Toast.fire({
    icon: "question",
    title: "Draw offered by opponent?",
  }).then((result) => {
    if (result.isConfirmed) {
      socket.emit("draw agreed", roomId);
      gameAlert("Draw", "by agreement", "warning");
    }
  });
});

socket.on("draw agreed", () => {
  gameAlert("Draw", "by agreement", "warning");
});

socket.on("rematch offer", () => {
  Toast.fire({
    icon: "question",
    title: "Rematch offered by opponent?",
  }).then((result) => {
    if (result.isConfirmed) {
      gameOver = false;
      board = Chessboard("myBoard", config);
      socket.emit("rematch accepted", roomId);
    }
  });
});

socket.on("rematch accepted", (nwRoomId) => {
  let nwColor = "black";
  if (player_color == "black") {
    nwColor = "white";
  }
  console.log(roomId);
  socket.emit("leave room", roomId);
  window.location.replace(
    `/online?mode=bullet&roomId=${nwRoomId}&color=${nwColor}`
  );
});
