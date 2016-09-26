
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
var port = process.env.PORT || 3030;  //For Heroku cloud hosting uncomment
//var port=3030;    //Uncomment for local server 
server.listen(port, function () {
  console.log('Server started at ' + server.address().port);
  console.log("Waiting for DB connection!!!");
  //on successfull start initiate mongo db connection
  mongo.init();
});

io.on('connection', function (socket) {
  socket.on("disconnect", () => {
    if (sockets[socket.id]) {
      var roomNumber = sockets[socket.id].room;
      if (rooms[roomNumber].hostSocketID == socket.id) {  //checking if socket is host
        rooms[roomNumber] = new Room();
        console.log("host disconnected");
        //If host get disconnected then abort the game
        io.in(roomNumber).emit('abortGame');
        socket.leave(roomNumber);
      } else {
        //if player is leaving
        io.in(roomNumber).emit('playerOffline', {
          playerID: sockets[socket.id].playerID,
          playerName: getPlayerName(sockets[socket.id].playerID, rooms[roomNumber].players)
        });
        
        for (var i = 0; i < rooms[roomNumber].players.length; i++) {
          if (rooms[roomNumber].players[i].playerID == sockets[socket.id].playerID) {
            console.log("Player disconnected: " +rooms[roomNumber].players[i].playerName);
            rooms[roomNumber].players = rooms[roomNumber].players.splice(i, 1);
          }
        }
        if(rooms[roomNumber].players.length<1) io.in(roomNumber).emit('roomEmpty');
        socket.leave(sockets[socket.id]); //leave the game room
        sockets[socket.id] = null;  //Make socket record null
      }
    }
  });
  socket.on("iAmHost", (data) => {
    console.log("I am host: " + socket.id);
    roomNumber++;
    addHostToRoom(socket.id, roomNumber);
    socket.join(roomNumber);
    sockets[socket.id] = {      //socket-room cross ref
      room: roomNumber
    };
  });
  socket.on("addPlayer", (data) => {
    var playerRoom = getRoomOfPlayer(data.playerID);
    if (playerRoom == null) {
      mongo.db.collection(mongo.studentCollection).find({
        "_id": data.playerID,
      }).toArray((err, docs) => {
        var room = sockets[socket.id].room; //getting room number
        if (err) {
          console.log("DB error while fetching the player");
        } else {
          if (docs.length > 0) {
            player = new Player("", docs[0]);  //creating player
            console.log("Adding player " + data.playerID + " to room " + room);
            addPlayerToRoom(player, room); //adding player to room
            socket.emit('addPlayerResponse', {
              isPlayerValid: true,
              playerInfo: {
                playerID: docs[0]._id,
                playerName: docs[0].StudentName,
                quizScore: docs[0].QuizScore
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
    console.log("Asking Question");
    console.log(rooms[roomNumber].answeredQuestions);
    //if all questions has been answered then can't ask further questions
    var questionNumber = rooms[roomNumber].currentQuestion;
    console.log("Current Question ", questionNumber);
    if (rooms[roomNumber].questions.length > rooms[roomNumber].answeredQuestions.length) {
      while (repetedQuestion(questionNumber)) {
        console.log("Repeated question: " + repetedQuestion(questionNumber));
        questionNumber = getRandomQuestionNum(1, rooms[roomNumber].questions.length - 1); //getting random question  number
        console.log("Random question: " + questionNumber);
      }
      rooms[roomNumber].answeredQuestions.push(questionNumber);     //Storing the answered question so that we don't repeat them
      rooms[roomNumber].currentQuestion = questionNumber;             //this variable will keep the current question in the room
      rooms[roomNumber].buzzerSequence = [];  //clearing the buzzer sequence
      //On successfull generation of question number. push the question to the clients in the room 
      io.in(roomNumber).emit('question', { question: rooms[roomNumber].questions[questionNumber] });
    } else {  //End Of the Quiz
      console.log("Quiz Ended");
      saveScoreToMLab(rooms[roomNumber].players);
      io.in(roomNumber).emit('quizEnd', {
        players: rooms[roomNumber].players
      });
    }
  });

  function saveScoreToMLab(players) {
    for (i = 0; i < players.length; i++) {
      var cursor = mongo.db.collection(mongo.studentCollection).find({ _id: players[i]._id });
      var doc = cursor.hasNext() ? cursor.next() : null;
      if (doc) {
        var scoreString = doc.QuizScore + "#" + Date.now + "~" + players[i].quizScore;
        mongo.db.collection(mongo.studentCollection).update({
          _id: players[i]._id
        },
          {
            QuizScore: scoreString
          });
      }
    }

  }
  /*
  checkAnswer - is to check the answer selected by the player for wrong or right
  */
  socket.on("checkAnswer", (data) => {
    var roomNumber = sockets[socket.id].room;
    var questionNumber = rooms[roomNumber].currentQuestion;
    var question = rooms[roomNumber].questions[questionNumber];

    var players = rooms[roomNumber].players;    //Retriving player list in the room
    var playerIndex = -1;
    var isAnswerCorrect = false;
    for (var i = 0; i < players.length; i++) {
      if (players[i].playerID == sockets[socket.id].playerID) {
        playerIndex = i;
        break;
      }
    }
    if (question.answer == data.answer) {
      players[playerIndex].quizScore++;
      isAnswerCorrect = true;
    }else{
      players[playerIndex].quizScore--;
    }
    rooms[roomNumber].players = players;    //assigning players back to the room with updated information
    socket.emit('answerStatus', {  //letting client know about the answer status
      playerScore: players[playerIndex].quizScore,
      isAnswerCorrect: isAnswerCorrect
    });
    io.in(roomNumber).emit('updateScore', {  //Broadcasting in room for score update notification
      playerScore: players[playerIndex].quizScore,
      playerID: sockets[socket.id].playerID
    });
  });

  socket.on("confirmScoreRecieved", (data) => {
    var roomNumber = sockets[socket.id].room;
    io.in(roomNumber).emit("readyForQuestion");
  })
  //Function to check if question has already been answered in the room
  function repetedQuestion(questionNumber) {
    var flag = false;
    for (var i = 0; i < rooms[roomNumber].answeredQuestions.length; i++) {
      if (rooms[roomNumber].answeredQuestions[i] == questionNumber) {
        flag = true;
        break;
      }
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
      console.log("Player " + playerID + " not belong to any room");
      socket.emit("invalidPlayer");
    }
  });

  /*
  This will update the socket id in the players array in room
  */
  socket.on("buzzer", (data) => {
    var roomNumber = sockets[socket.id].room;
    console.log("buzzer pressed by: " + socket.id + " player: " + socket.id + "  " + rooms[roomNumber].buzzerSequence.length);
    if (rooms[roomNumber].buzzerSequence.length <= 0) {    //If this socket is the first one to press the buzzer than execute this
      rooms[roomNumber].buzzerSequence.push(socket.id);    //First player to press the buzzer will answer the question
      socket.emit("firstToPressBuzzer"); //This event will be triggered to the socket who is answering the question
      io.in(roomNumber).emit("playerAnswering", {   //This is to let everyone know in the room that who pressed the buzzer first
        playerID: sockets[socket.id].playerID,
        playerName: getPlayerName(sockets[socket.id].playerID, rooms[roomNumber].players)
      });
    } else {
      rooms[roomNumber].buzzerSequence.push(socket.id);
    }
  });
});

/*
getPlayerName - will return the name of the player for player ID
*/
function getPlayerName(playerID, players) {
  var playerName = null;
  for (var i = 0; i < players.length; i++) {
    if (players[i].playerID == playerID) {
      playerName = players[i].playerName;
      break;
    }
  }
  return playerName;
}
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