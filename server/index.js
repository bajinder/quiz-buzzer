
var io = require('socket.io'),
  http = require('http'),
  server = http.createServer(),
  io = io.listen(server);
var common = require('./common.js'),
  mongo = common.mongo;



server.listen(3030, function () {
  console.log('Server started at 3030');
  console.log("Waiting for DB connection!!!");
  mongo.init();
});
io.on('connection', function (socket) {
  console.log('User Connected');
  socket.on('fetchGroupMembers', function (data) {
    console.log("groupCode: " + data.groupCode);
    mongo.db.collection(mongo.studentCollection).find({ GroupCode: data.groupCode }).toArray(function (err, docs) {
      console.log(docs);
      socket.emit("groupMembers", docs);
    })
  });
  
});
