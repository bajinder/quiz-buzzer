
var io = require('socket.io'),
  http = require('http'),
  server = http.createServer(),
  io = io.listen(server);
var common = require('./common.js'),
  mongo = common.mongo;
var Room = require('./rooms.js').Room;
var Player = require('./rooms.js').Player;
var Question = require('./rooms.js').Question;

var roomNumber = -1;
var sockets = {}; //Array for cross ref for socketID and player ID
var rooms = []; //Array of rooms vs host vs players
//starting the server
server.listen(3030, function () {
  console.log('Server started at 3030');
  console.log("Waiting for DB connection!!!");
  //on successfull start initiate mongo db connection
  mongo.init();
});

io.on('connection', function (socket) {
  socket.on("disconnect", () => {
    if (sockets[socket.id]) {
      var room = sockets[socket.id].room;
      if (rooms[room].hostSocketID == socket.id) {  //checking if socket is host
        rooms[room] = new Room();
        console.log("host disconnected");
        //If host get disconnected then abort the game
        //* More code here *//
        io.in(room).emit('abortGame');
        socket.leave(room);
      } else {
        //if player is leaving
        io.in(room).emit('playerOffline', { playerID: sockets[socket.id].playerID });
        socket.leave(sockets[socket.id]); //leave the game room
        sockets[socket.id] = null;
        console.log(rooms[room].players);
        for (var i = 0; i < rooms[room].players.length; i++) {
          if (rooms[room].players[i].playerSocketID == socket.id) {
            console.log("Player disconnected: " + JSON.stringify(rooms[room].players[i]));
            rooms[room].players = rooms[room].players.splice(i, 1);
          }
        }
      }
    }
  });
  socket.on("iAmHost", (data) => {
    console.log("I am host: " + socket.id);
    roomNumber++;
    addHostToRoom(socket.id, roomNumber);
    socket.join(roomNumber);
    sockets[socket.id] = {      //socket to room cross ref
      room: roomNumber
    };
  });
  socket.on("addPlayer", (data) => {
    var playerRoom = getRoomOfPlayer(data.playerID);
    if (playerRoom == null) {
      mongo.db.collection(mongo.studentCollection).find({ "_id": data.playerID }).toArray((err, docs) => {
        var room = sockets[socket.id].room; //getting room number
        if (err) {
          console.log("DB error while fetching the player");
        } else {
          if (docs.length > 0) {
            player = new Player(socket.id, data.playerID);  //creating player
            console.log("Adding player " + data.playerID + " to room " + room);
            addPlayerToRoom(player, room); //adding player to room
            socket.emit('addPlayerResponse', {
              isPlayerValid: true,
              playerInfo: {
                id: docs[0]._id,
                Name: docs[0].StudentName,
                QuizScore: docs[0].QuizScore
              }
            });
          } else {
            socket.emit('addPlayerResponse', { isPlayerValid: false });
          }
        }
      });
    } else {
      socket.emit('playerAddedInOtherRoom');
    }
  });
  //Host is requesting server for the next question from db
  socket.on("prepareQuestions", (data) => {
    mongo.db.collection(mongo.questionsCollection).find({}).toArray((err, docs) => {
      var roomNumber = sockets[socket.id].room;
      console.log("Preparing quesrion for room " + roomNumber);
      for (var i = 0; i < docs.length; i++) {
        var question = new Question(docs[i]);
        rooms[roomNumber].questions.push(question);
      }
    });
  });
  socket.on("startingGame", () => {
    var roomNumber = sockets[socket.id].room;
    io.in(roomNumber).emit('gameStarted');
  });
  socket.on("askQuestion", (data) => {
    var roomNumber = sockets[socket.id].room;
    var qusNum = 0;
    console.log("Asking Question");
    //if all questions has been answered then can't ask further questions
    if (rooms[roomNumber].questions.length > rooms[roomNumber].answeredQuestions.length) {
      while (repetedQuestion(qusNum)) {
        qusNum = getRandomQuestionNum(0, rooms[roomNumber].questions.length);
      }
      //On successfull generation of question number. push the question to the clients in the room
      console.log("Question " + qusNum);
      io.in(roomNumber).emit('question', { question: rooms[roomNumber].questions[qusNum] });
    } else {
      io.in(roomNumber).emit('quizEnd');
    }
  });
  //Function to check if question has already been answered in the room
  function repetedQuestion(qNum) {
    var flag = false;
    if (rooms[roomNumber].answeredQuestions[qNum] == true) {
      flag = true;
    }
    return flag;
  }
  function getRandomQuestionNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  //Player Joining the Game
  socket.on("joinGame", (data) => {
    var playerID = data.playerID;
    var room = getRoomOfPlayer(playerID);
    if (room != null) {
      console.log("Player " + playerID + " joining game in room " + room);
      sockets[socket.id] = {  //Cross ref for socket id and room
        "room": room,
        "playerID": playerID
      };
      socket.join(room);
      io.in(room).emit('playerOnline', { playerID: playerID });
    } else {
      console.log("Player does not belong to any room");
      socket.emit("invalidPlayer");
    }

  });

  socket.on("buzzer", (data) => {
    var roomNumber = sockets[socket.id].room;
    console.log("buzzer pressed by: " + socket.id + " player: " + socket.id +"  "+rooms[roomNumber].buzzerSequence.length);
    if (rooms[roomNumber].buzzerSequence.length <=0) {    //If this socket is the first one to press the buzzer than execute this
      rooms[roomNumber].buzzerSequence.push(socket.id);    //First player to press the buzzer will answer the question
      io.in(roomNumber).emit("playerAnswering", {
        playerID: sockets[socket.id],
        socketID: socket.id
      });
    } else {
      rooms[roomNumber].buzzerSequence.push(socket.id);
    }
  });
});
function getRoomOfPlayer(playerID) {
  var playerRoom = null;
  for (var roomNumber = 0; roomNumber < rooms.length; roomNumber++) {
    for (var j = 0; j < rooms[roomNumber].players.length; j++) {
      var player = rooms[roomNumber].players[j];
      if (player.playerID == playerID) {
        playerRoom = roomNumber;
        break;
      }
    }
    if (playerRoom != null) break;
  }
  return playerRoom;
}

function addHostToRoom(hostSocketID, room) {
  if (rooms[room]) {
    rooms[room].hostSocketID = hostSocketID;  //adding host to the room if room exist
  } else {
    rooms[room] = new Room();   //create new room if room doesn't exist
    rooms[room].hostSocketID = hostSocketID;  //adding host to the room
  }
}
function addPlayerToRoom(player, room) {
  if (rooms[room]) { //if room exist then add player
    rooms[room].players.push(player);
  }
  else {  //if room doesn't exist create and add player
    rooms[room].hostSocketID = null;
    rooms[room].players.push(player);
  }
  //console.log("Room info " + rooms.toString());
}