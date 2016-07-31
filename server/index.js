
var io = require('socket.io'),
  http = require('http'),
  server = http.createServer(),
  io = io.listen(server);
var common= require('./common.js'),
  mongo=common.mongo;



server.listen(3030, function () {
  console.log('Server started at 3030');
  console.log("Waiting for DB connection!!!");
  mongo.init();
});
io.on('connection', function (socket) {
  console.log('User Connected');
  io.emit('broadcast', 'broadcasting');
  socket.on('news', function (msg) {
    console.log("news revieced " + msg);
    socket.emit('pb',"private Broadcasting");
  });
  socket.on('a',function(d){
    console.log('sss '+d);
  })
});
