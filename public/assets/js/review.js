var board = null;
var game = new Chess();
var $status = $("#status");
var $fen = $("#fen");
var $pgn = $("#pgn");
var moveSound = new Audio("/assets/sounds/move-self.mp3");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var redSquareRed = "#ff0000";
var moveCnt = document.querySelector(".move");
var whiteMove = document.querySelector(".whiteMove");
var blackMove = document.querySelector(".blackMove");
var cnt = 1;
var messageBody = document.querySelector(".moveTimeline");
var pointer = 0;
var startingPos = document.getElementById("startingPos");
var backward = document.getElementById("backward");
var forward = document.getElementById("forward");
var endingPos = document.getElementById("endingPos");
var matchArr = match.gameFEN.slice();
matchArr.splice(
  0,
  0,
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
);
var len = matchArr.length;
var bestMoveBtn = document.getElementById("bestMove");
var topEngineLineBtn = document.getElementById("topEngineLine");
var currentPos = document.getElementById("currentPos");
var bestMove = null;
var topEngineLine = null;
var evaluation = 1.05;
var allowed = true;
var whiteMoveReview = document.getElementById("whiteMoveReview");
var blackMoveReview = document.getElementById("blackMoveReview");
var whiteEval = document.getElementById("whiteEval");
var blackEval = document.getElementById("blackEval");
var whiteEvalText = document.getElementById("whiteEvalText");
var blackEvalText = document.getElementById("blackEvalText");
var evalMain = document.getElementById("evalMain");

function calculatePer(value) {
  let e = Math.abs(value);
  if (e >= 10) return 49;
  let per = Math.log10(e * 1.3 + 1);
  per = (per / 1.3) * 50;
  per = per.toFixed(1);
  return per * 1;
}

function updateEvalBar(value) {
  let per = calculatePer(value);
  if (value >= 0) {
    let percentW = 50 + per;
    let percentB = 50 - per;
    whiteEvalText.innerText = value;
    whiteEval.style.height = `${percentW}%`;
    blackEvalText.innerText = "";
    blackEval.style.height = `${percentB}%`;
  } else {
    let percentW = 50 - per;
    let percentB = 50 + per;
    whiteEvalText.innerText = "";
    whiteEval.style.height = `${percentW}%`;
    blackEvalText.innerText = Math.abs(value);
    blackEval.style.height = `${percentB}%`;
  }
}

function stockfishAnalysis(currFEN) {
  bestMoveBtn.disabled = true;
  bestMoveBtn.innerText = "Calculating...";
  topEngineLineBtn.disabled = true;
  topEngineLineBtn.innerText = "Calculating...";
  xhr.open(
    "GET",
    `https://stockfish.online/api/s/v2.php?fen=${currFEN}&depth=10`,
    true
  );
  xhr.onload = () => {
    bestMoveBtn.disabled = false;
    bestMoveBtn.innerText = "BestMove";
    topEngineLineBtn.disabled = false;
    topEngineLineBtn.innerText = "Top Engine Line";
    let data = JSON.parse(xhr.responseText);
    if (data.success == true) {
      let bestMoveRes = data.bestmove;
      bestMove = bestMoveRes.split(" ")[1];
      topEngineLine = data.continuation;
      evaluation = data.evaluation;
      let mate = data.mate;
      if (mate != null) {
        if (mate > 0) {
          whiteEvalText.innerText = `M${mate}`;
          whiteEval.style.height = "100%";
          blackEvalText.innerText = "";
          blackEval.style.height = "0%";
        } else {
          blackEvalText.innerText = `M${mate}`;
          blackEval.style.height = "100%";
          whiteEvalText.innerText = "";
          whiteEval.style.height = "0%";
        }
      } else {
        updateEvalBar(evaluation);
      }
    }
  };
  xhr.send();
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

bestMoveBtn.addEventListener("click", () => {
  if (bestMove == null || allowed == false) return;
  board.position(matchArr[pointer]);
  let newBestMove = bestMove.slice(0, 2) + "-" + bestMove.slice(2);
  setTimeout(() => {
    moveSound.play();
    board.move(newBestMove);
  }, 500);
});
topEngineLineBtn.addEventListener("click", () => {
  if (topEngineLine == null || allowed == false) return;
  whiteMoveReview.replaceChildren();
  blackMoveReview.replaceChildren();
  board.position(matchArr[pointer]);
  allowed = false;
  let topEngineLineArr = topEngineLine.split(" ");
  let n = topEngineLineArr.length;
  let i = 0;
  let currColor = "white";
  if (matchArr[pointer].split(" ")[1] == "b") {
    currColor = "black";
    let li = document.createElement("li");
    li.innerText = "->";
    li.style.marginTop = "0.5rem";
    whiteMoveReview.appendChild(li);
  }
  let id = setInterval(() => {
    if (i >= n) {
      allowed = true;
      clearInterval(id);
    }
    let topMove = topEngineLineArr[i];
    i++;
    if (topMove) {
      topMove = topMove.slice(0, 2) + "-" + topMove.slice(2);
      moveSound.play();
      board.move(topMove);
      let li = document.createElement("li");
      li.innerText = topMove;
      li.style.marginTop = "0.5rem";
      if (currColor == "white") {
        whiteMoveReview.appendChild(li);
        currColor = "black";
      } else {
        blackMoveReview.appendChild(li);
        currColor = "white";
      }
    }
  }, 500);
});
currentPos.addEventListener("click", () => {
  if (allowed == false) return;
  board.position(matchArr[pointer]);
});

startingPos.addEventListener("click", () => {
  if (allowed == false) return;
  pointer = 0;
  let currFEN = matchArr[pointer];
  board.position(currFEN);
  stockfishAnalysis(currFEN);
});
backward.addEventListener("click", () => {
  if (allowed == false) return;
  pointer = Math.max(0, --pointer);
  let currFEN = matchArr[pointer];
  board.position(currFEN);
  stockfishAnalysis(currFEN);
});
forward.addEventListener("click", () => {
  if (allowed == false) return;
  pointer = Math.min(len - 1, ++pointer);
  let currFEN = matchArr[pointer];
  moveSound.play();
  board.position(currFEN);
  stockfishAnalysis(currFEN);
});
endingPos.addEventListener("click", () => {
  if (allowed == false) return;
  pointer = len - 1;
  let currFEN = matchArr[pointer];
  board.position(currFEN);
  stockfishAnalysis(currFEN);
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

function updateSidebar(history) {
  let moveNum = 1;
  for (let currMove of history) {
    let li = document.createElement("li");
    li.innerText = currMove;
    li.style.marginTop = "0.5rem";
    let color = "";
    if (cnt % 2) color = "rgb(28, 28, 28)";
    li.style.backgroundColor = color;
    if (moveNum % 2) {
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
    moveNum++;
  }
  messageBody.scrollTop = messageBody.scrollHeight;
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
  }

  // draw?
  else if (game.in_draw()) {
    status = "Game over, drawn position";
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
  draggable: false,
  position: "start",
  onDragStart: onDragStart,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
board = Chessboard("myBoard", config);
if (match.p1Color == "black") {
  board.orientation("black");
  whiteEval.classList.remove("bg-white");
  whiteEval.classList.add("bg-black");
  whiteEval.classList.remove("text-black");
  whiteEval.classList.add("text-white");
  blackEval.classList.remove("bg-black");
  blackEval.classList.add("bg-white");
  blackEval.classList.remove("text-white");
  blackEval.classList.add("text-black");
  [whiteEval, blackEval] = [blackEval, whiteEval];
  [whiteEvalText, blackEvalText] = [blackEvalText, whiteEvalText];
}
updateSidebar(match.history);

updateStatus();
