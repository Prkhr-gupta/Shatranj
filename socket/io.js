const { v4: uuidv4 } = require("uuid");

module.exports = (io) => {
  let rooms = [];
  let allGames = {};
  allGames["randomId123"] = {
    roomId: "randomId123",
    history: [],
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

    socket.on("join room", (roomId) => {
      socket.join(roomId);
      if (typeof allGames[roomId] === "undefined") {
        allGames[roomId] = {
          roomId: roomId,
          history: [],
          lastMoveColor: "black",
        };
      }
      io.to(roomId).emit("startGame", allGames[roomId]);
    });

    socket.on("leave room", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("move", function (move, roomId, color, history) {
      allGames[roomId].lastMoveColor = color;
      allGames[roomId].history = history;
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
  });
};
