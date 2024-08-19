const { v4: uuidv4 } = require("uuid");

module.exports = (io) => {
  let rooms = [];
  let allGames = {};
  allGames["randomId123"] = {
    roomId: "randomId123",
    history: [],
    verbose: [],
    player1Color: "",
    player2Color: "",
    gameHasStarted: false,
  };
  io.on("connection", (socket) => {
    console.log("New socket connection");
    socket.on("create room", () => {
      if (rooms.length == 0) {
        let roomId = uuidv4();
        let color = "white";
        rooms.push(roomId);
        io.to(socket.id).emit("room id", roomId, color);
      } else {
        let color = "black";
        io.to(socket.id).emit("room id", rooms[0], color);
        rooms.pop();
      }
    });

    socket.on("join room", (roomId, color) => {
      socket.join(roomId);
      if (typeof allGames[roomId] === "undefined") {
        allGames[roomId] = {
          roomId: roomId,
          history: [],
          verbose: [],
          lastMoveColor: "black",
          player1Color: `${color}`,
          player2Color: "",
          gameHasStarted: false,
        };
      } else {
        if (color !== allGames[roomId].player1Color) {
          allGames[roomId].player2Color = `${color}`;
          if (!allGames[roomId].gameHasStarted) {
            io.to(roomId).emit("startGame", allGames[roomId]);
            allGames[roomId].gameHasStarted = true;
          }
        }
      }
      io.to(socket.id).emit("enterGame", allGames[roomId]);
    });

    socket.on("leave room", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("move", function (move, roomId, color, history, verbose) {
      allGames[roomId].lastMoveColor = color;
      allGames[roomId].history = history;
      allGames[roomId].verbose = verbose;

      io.to(roomId).emit("newMove", move, allGames[roomId]);
    });

    socket.on("resign", (roomId) => {
      socket.broadcast.to(roomId).emit("opp resigned");
    });

    socket.on("draw", (roomId) => {
      socket.broadcast.to(roomId).emit("draw offer");
    });

    socket.on("draw agreed", (roomId) => {
      socket.broadcast.to(roomId).emit("draw agreed");
    });

    socket.on("rematch", (roomId) => {
      socket.broadcast.to(roomId).emit("rematch offer");
    });

    socket.on("rematch accepted", (roomId) => {
      let nwRoomId = uuidv4();
      io.to(roomId).emit("rematch accepted", nwRoomId);
    });

    socket.on("new message", (roomId, text) => {
      socket.broadcast.to(roomId).emit("msg recieved", text);
    });
  });
};
