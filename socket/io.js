const User = require("../models/user.js");
const Match = require("../models/match.js");
const Chat = require("../models/chat.js");
const { v4: uuidv4 } = require("uuid");

module.exports = (io) => {
  let rooms = {
    bullet: [],
    blitz: [],
    rapid: [],
  };
  let games = {
    bullet: {},
    blitz: {},
    rapid: {},
  };
  io.on("connection", async (socket) => {
    console.log("New socket connection");
    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    socket.on("create private room", async (mode, user1, user2, color) => {
      await User.updateOne({ username: user1 }, { isPlaying: true });
      await User.updateOne({ username: user2 }, { isPlaying: true });
      let roomId = uuidv4();
      if (color == "random") {
        let random = Math.floor(Math.random() * 2 + 1);
        if (random == 1) color = "white";
        else color = "black";
      }
      let opponentColor = "white";
      if (color == "white") opponentColor = "black";
      io.to(user1).emit("room id", mode, roomId, color);
      io.to(user2).emit("room id", mode, roomId, opponentColor);
    });

    socket.on("create room", async (mode, username) => {
      await User.updateOne({ username: username }, { isPlaying: true });
      if (rooms[mode].length == 0) {
        let roomId = uuidv4();
        let color = "white";
        rooms[mode].push(roomId);
        io.to(socket.id).emit("room id", mode, roomId, color);
      } else {
        let color = "black";
        io.to(socket.id).emit("room id", mode, rooms[mode][0], color);
        rooms[mode].pop();
      }
    });

    socket.on("join room", (mode, roomId, color, username) => {
      socket.join(roomId);
      if (typeof games[mode][roomId] === "undefined") {
        games[mode][roomId] = {
          roomId: roomId,
          history: [],
          verbose: [],
          lastMoveColor: "black",
          player1: `${username}`,
          player2: "",
          player1Color: `${color}`,
          player2Color: "",
          gameHasStarted: false,
          timer1: 0,
          timer2: 0,
          gameOver: false,
          chats: [],
        };
        io.to(socket.id).emit("enterGame", games[mode][roomId]);
      } else {
        if (color !== games[mode][roomId].player1Color) {
          if (!games[mode][roomId].gameHasStarted) {
            games[mode][roomId].player2 = `${username}`;
            games[mode][roomId].player2Color = `${color}`;
            let timeControl =
              mode === "bullet" ? 60 : mode === "blitz" ? 180 : 600;
            games[mode][roomId].timer1 = timeControl;
            games[mode][roomId].timer2 = timeControl;
            games[mode][roomId].gameHasStarted = true;
            io.to(roomId).emit("startGame", games[mode][roomId]);
            timeout(4000).then(() => {
              let timeId = setInterval(() => {
                if (
                  games[mode][roomId].lastMoveColor ==
                  games[mode][roomId].player1Color
                )
                  games[mode][roomId].timer2--;
                else games[mode][roomId].timer1--;
                io.to(roomId).emit("new time", games[mode][roomId]);
                if (games[mode][roomId].gameOver == true) {
                  clearInterval(timeId);
                }
              }, 1000);
            });
          }
        }
        io.to(socket.id).emit("enterGame", games[mode][roomId]);
      }
    });

    socket.on("game over", async (mode, roomId, username, icon, gameFEN) => {
      let ratingChange = 0;
      if (icon == "error") ratingChange = -8;
      if (icon == "success") ratingChange = 8;
      let user = await User.findOneAndUpdate(
        { username: username },
        { isPlaying: false }
      );
      let currRating = user.rating;
      if (currRating < 50) ratingChange = 0;
      let newRating = currRating + ratingChange;
      let title = "Beginner";
      if (newRating >= 1000 && newRating < 1500) title = "Intermediate";
      if (newRating >= 1500 && newRating < 2000) title = "Candidate Master";
      if (newRating >= 2000 && newRating < 2500) title = "FIDE Master";
      if (newRating >= 2500 && newRating < 3000) title = "International Master";
      if (newRating >= 3000) title = "Grandmaster";
      await User.updateOne(
        { username: username },
        { rating: newRating },
        { title: title }
      );
      games[mode][roomId].gameOver = true;
      io.to(username).emit("game results", currRating, ratingChange, newRating);
      let opponent = games[mode][roomId].player1;
      let userColor = games[mode][roomId].player2Color;
      let opponentColor = games[mode][roomId].player1Color;
      if (opponent == username) {
        opponent = games[mode][roomId].player2;
        userColor = games[mode][roomId].player1Color;
        opponentColor = games[mode][roomId].player2Color;
      }
      let result = "1-0";
      if (icon == "error") result = "0-1";
      if (icon == "warning") result = "1/2-1/2";
      let movesCnt = games[mode][roomId].history.length;
      let moves = Math.floor((movesCnt + 1) / 2);
      let newMatch = new Match({
        roomId: roomId,
        mode: mode,
        player1: username,
        player2: opponent,
        p1Color: userColor,
        p2Color: opponentColor,
        result: result,
        ratingChange: ratingChange,
        newRating: newRating,
        moves: moves,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        history: games[mode][roomId].history,
        gameFEN: gameFEN,
      });
      await newMatch.save();
      let res = "draws";
      if (icon == "success") res = "wins";
      else if (icon == "error") res = "loses";
      let stats = user.stats;
      stats.overall.games++;
      stats.overall[res]++;
      stats[mode].games++;
      stats[mode][res]++;
      await User.updateOne(
        { username: username },
        { $push: { matches: newMatch }, stats: stats }
      );
    });

    socket.on("leave room", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("move", function (mode, move, roomId, color, history, verbose) {
      games[mode][roomId].lastMoveColor = color;
      games[mode][roomId].history = history;
      games[mode][roomId].verbose = verbose;
      let timeControl = mode === "bullet" ? 1 : mode === "blitz" ? 2 : 0;
      if (color == games[mode][roomId].player1Color)
        games[mode][roomId].timer1 += timeControl;
      else games[mode][roomId].timer2 += timeControl;

      io.to(roomId).emit("newMove", move, games[mode][roomId]);
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

    socket.on("challenge", async (user, opponent, gamemode, color) => {
      let user1 = await User.findOne({ username: user });
      let user2 = await User.findOne({ username: opponent });
      if (user2.isPlaying == true) {
        io.to(user).emit("challenge failed", opponent);
      } else if (user1.isPlaying == true) {
        io.to(user).emit("challenge failed", user);
      } else {
        let opponentColor = "random";
        if (color == "white") opponentColor = "black";
        if (color == "black") opponentColor = "white";
        io.to(opponent).emit("challenge", user, gamemode, opponentColor);
      }
    });

    socket.on("challenge declined", (user, opponent) => {
      io.to(user).emit("challenge declined", opponent);
    });

    socket.on("new message", (mode, roomId, text, color) => {
      games[mode][roomId].chats.push({ text, color });
      socket.broadcast.to(roomId).emit("live msg recieved", text);
    });

    socket.on("private message", async (to, text, from) => {
      let newChat = new Chat({
        message: text,
        from: from,
        to: to,
        time: new Date(),
        isRead: false,
      });
      await newChat.save();
      io.to(to).emit("msg recieved", text, from);
    });

    socket.on("friend request", async (from, to) => {
      await User.updateOne({ username: to }, { $push: { requests: from } });
      io.to(to).emit("friend request", from);
    });

    socket.on("accepted", async (username1, username2) => {
      let user1 = await User.findOne({ username: username1 });
      let user2 = await User.findOne({ username: username2 });
      await User.updateOne(
        { username: username1 },
        { $push: { friends: user2 } }
      );
      await User.updateOne(
        { username: username2 },
        { $push: { friends: user1 } }
      );
      await User.updateOne(
        { username: username2 },
        { $pull: { requests: username1 } }
      );
      io.to(username1).emit(
        "accepted",
        username2,
        user2.rating,
        user2.isOnline
      );
      io.to(username2).emit(
        "accepted",
        username1,
        user1.rating,
        user1.isOnline
      );
    });

    socket.on("declined", async (username1, username2) => {
      await User.updateOne(
        { username: username2 },
        { $pull: { requests: username1 } }
      );
    });

    socket.on("removed", async (user, friend) => {
      let user1 = await User.findOne({ username: user });
      let user2 = await User.findOne({ username: friend });
      await User.updateOne(
        { username: user },
        { $pull: { friends: user2._id } }
      );
      await User.updateOne(
        { username: friend },
        { $pull: { friends: user1._id } }
      );
      io.to(friend).emit("removed", user);
    });

    socket.on("userConnect", async (username) => {
      socket.join(username);
      socket.privateRoom = username;
      let user = await User.findOneAndUpdate(
        { username: username },
        { $set: { isOnline: true } }
      ).populate("friends");
      for (let friend of user.friends) {
        io.to(friend.username).emit("friend connected", username);
      }
    });

    socket.on("disconnect", async () => {
      let username = socket.privateRoom;
      let user = await User.findOneAndUpdate(
        { username: username },
        { $set: { isOnline: false } }
      ).populate("friends");
      if (user) {
        for (let friend of user.friends) {
          io.to(friend.username).emit("friend disconnected", username);
        }
      }
    });
  });
};
