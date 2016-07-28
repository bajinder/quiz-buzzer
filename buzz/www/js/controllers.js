
angular.module('app.controllers', [])

    .controller('buzzerCtrl', function ($scope) {

    })

    .controller('startGameCtrl', function ($scope) {
        socket = io('http://localhost:3030');
        socket.emit('news', 'this is news', function (data) {
            console.log(data);

        });
        socket.on('broadcast', function (data) {
            console.log("broadcasting revcieved " + data);
        })
        socket.on('pb', function (d) {
            console.log('private: ' + d);
        });
    })

    .controller('joinGameCtrl', function ($scope) {

    })
