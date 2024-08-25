import { openings } from "../opening.js";
var opening = document.getElementById("opening");
var currOp = "";
var board = null;
var game = new Chess();
var $status = $("#status");
var $fen = $("#fen");
var $pgn = $("#pgn");
var moveSound = new Audio("./assets/sounds/move-self.mp3");
var captureSound = new Audio("./assets/sounds/capture.mp3");
var castleSound = new Audio("./assets/sounds/castle.mp3");
var gameEndSound = new Audio("./assets/sounds/game-end.webm");
var gameStartSound = new Audio("./assets/sounds/game-start.mp3");
var checkSound = new Audio("./assets/sounds/move-check.mp3");
var lowTimeSound = new Audio("./assets/sounds/tenseconds.mp3");
var promoteSound = new Audio("./assets/sounds/promote.mp3");
var notifySound = new Audio("./assets/sounds/notify.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var redSquareRed = "#ff0000";
var moveCnt = document.querySelector(".move");
var whiteMove = document.querySelector(".whiteMove");
var blackMove = document.querySelector(".blackMove");
var cnt = 1;
var messageBody = document.querySelector(".moveTimeline");
var chatBody = document.querySelector(".chatTimeline");
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get("mode");
const roomId = urlParams.get("roomId");
const player_color = urlParams.get("color");
socket.emit("join room", mode, roomId, player_color);
let gameHasStarted = false;
let gameOver = false;
var draw = document.getElementById("draw");
var rematch = document.getElementById("rematch");
var resign = document.getElementById("resign");

function gameAlert(title, msg, icon) {
  gameEndSound.play();
  gameOver = true;
  socket.emit("game over", mode, roomId);
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

function updateSidebar(move, history) {
  let currMove = history[history.length - 1];
  let li = document.createElement("li");
  li.innerText = currMove;
  li.style.marginTop = "0.5rem";
  let color = "";
  if (cnt % 2) color = "rgb(28, 28, 28)";
  li.style.backgroundColor = color;
  if (move != null && move.color == "w") {
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
  updateSidebar(move, game.history());
  socket.emit(
    "move",
    mode,
    theMove,
    roomId,
    player_color,
    game.history(),
    game.history({ verbose: true })
  );
  updateStatus();
}

socket.on("newMove", function (theMove, gameInfo) {
  let move = game.move(theMove);
  if (move === null) return;
  updateSidebar(move, game.history());
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

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
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
    timerProgressBar: "timer",
  },
});

socket.on("enterGame", function (gameInfo) {
  if (gameInfo.gameHasStarted === true) gameHasStarted = true;
  let arr = gameInfo.verbose;
  let history = [];
  for (let i = 0; i < arr.length; i++) {
    let str = `${arr[i].from}-${arr[i].to}`;
    board.move(str);
    let theMove = game.move({
      from: arr[i].from,
      to: arr[i].to,
      promotion: "q",
    });
    history.push(gameInfo.history[i]);
    updateSidebar(theMove, history);
    updateStatus();
  }
  for (let chat of gameInfo.chats) {
    let pos = "self-start";
    if (player_color == chat.color) pos = "self-end";
    createMsg(chat.text, pos);
  }
});

let timer2 = document.getElementById("timer2");
let timer1 = document.getElementById("timer1");
// timer2.innerText = startTime2;

socket.on("startGame", (gameInfo) => {
  Toast.fire({
    icon: "info",
    // title: "Match starting in x",
    html: "Match starting in <b></b>",
    didOpen: () => {
      Toast.showLoading();
      const timer = Toast.getPopup().querySelector("b");
      setInterval(() => {
        let t = Math.floor(Toast.getTimerLeft() / 1000);
        timer.textContent = `${t}`;
      }, 100);
    },
    showConfirmButton: false,
  });
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // async function sleep(fn, ...args) {
  //   await timeout(3000);
  //   return fn(...args);
  // }
  timeout(4000).then(() => {
    gameStartSound.play();
    gameHasStarted = true;
    draw.style.display = "inline-block";
    resign.style.display = "inline-block";
    let t = gameInfo.timer2;
    let min = Math.floor(t / 60);
    let sec = t % 60;
    let time = min + ":" + (sec < 10 ? "0" : "") + sec;
    timer2.innerText = time;
    timer1.innerText = time;
  });
});

let flag1 = true;
let flag2 = true;
socket.on("new time", (gameInfo) => {
  if (gameOver) return;
  let t2 = gameInfo.timer2;
  let min2 = Math.floor(t2 / 60);
  let sec2 = t2 % 60;
  let time2 = min2 + ":" + (sec2 < 10 ? "0" : "") + sec2;
  let t1 = gameInfo.timer1;
  let min1 = Math.floor(t1 / 60);
  let sec1 = t1 % 60;
  let time1 = min1 + ":" + (sec1 < 10 ? "0" : "") + sec1;
  if (player_color === gameInfo.player1Color) {
    timer2.innerText = time2;
    timer1.innerText = time1;
    if (t2 <= 20) timer2.style.backgroundColor = "red";
    else timer2.style.backgroundColor = "rgb(163 163 163)";
    if (t1 <= 20) {
      timer1.style.backgroundColor = "red";
      if (flag1) {
        lowTimeSound.play();
        flag1 = false;
      }
    } else timer1.style.backgroundColor = "rgb(163 163 163)";
    if (t2 <= 0) {
      gameAlert("You Won", "on time", "success");
    }
    if (t1 <= 0) {
      gameAlert("You Lost", "on time", "error");
    }
  } else {
    timer2.innerText = time1;
    timer1.innerText = time2;
    if (t2 <= 20) {
      timer1.style.backgroundColor = "red";
      if (flag2) {
        lowTimeSound.play();
        flag2 = false;
      }
    } else timer1.style.backgroundColor = "rgb(163 163 163)";
    if (t1 <= 20) timer2.style.backgroundColor = "red";
    else timer2.style.backgroundColor = "rgb(163 163 163)";
    if (t2 <= 0) {
      gameAlert("You Lost", "on time", "error");
    }
    if (t1 <= 0) {
      gameAlert("You Won", "on time", "success");
    }
  }
});

socket.on("opp resigned", () => {
  gameAlert("You Won", "by resignation", "success");
});

socket.on("draw offer", () => {
  notifySound.play();
  Toast.fire({
    icon: "question",
    title: "Draw offered by opponent?",
    showConfirmButton: true,
    showDenyButton: true,
    confirmButtonText: "Accept",
    denyButtonText: "Decline",
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
  notifySound.play();
  Toast.fire({
    icon: "question",
    title: "Rematch offered by opponent?",
    showConfirmButton: true,
    showDenyButton: true,
    confirmButtonText: "Accept",
    denyButtonText: "Decline",
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
  socket.emit("leave room", roomId);
  window.location.replace(
    `/online?mode=bullet&roomId=${nwRoomId}&color=${nwColor}`
  );
});

let text = document.getElementById("newMsg");
let send = document.getElementById("sendMsg");
let msgBox = document.getElementById("messages");

function createMsg(text, pos) {
  let msg = document.createElement("div");
  msg.innerText = text;
  msg.style.position = "relative";
  msg.style.display = "flex";
  msg.style.backgroundColor = "rgb(229 229 229)";
  msg.style.color = "black";
  msg.style.maxWidth = "80%";
  msg.style.textWrap = "pretty";
  msg.style.overflowWrap = "break-word";
  msg.style.borderTopRightRadius = "2rem";
  msg.style.borderTopLeftRadius = "2rem";
  if (pos == "self-end") {
    msg.style.border = "2px solid rgb(34, 34, 126)";
    msg.style.borderBottomLeftRadius = "2rem";
  } else {
    msg.style.borderBottomRightRadius = "2rem";
    msg.style.border = "2px solid rgb(126, 34, 34)";
  }
  msg.style.alignSelf = pos;
  msg.style.margin = "0.5rem";
  msg.style.padding = "0.5rem 1rem";
  msg.style.lineHeight = "1.2rem";
  msgBox.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

send.addEventListener("click", () => {
  if (gameHasStarted && text.value !== "") {
    createMsg(text.value, "self-end");
    socket.emit("new message", mode, roomId, text.value, player_color);
    text.value = "";
  }
});
text.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    createMsg(text.value, "self-end");
    socket.emit("new message", mode, roomId, text.value, player_color);
    text.value = "";
  }
});

socket.on("msg recieved", (text) => {
  notifySound.play();
  createMsg(text, "self-start");
});
