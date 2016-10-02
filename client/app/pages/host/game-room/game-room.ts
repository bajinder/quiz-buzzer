import {Component, NgZone} from '@angular/core';
import {NavController, NavParams, Loading, Alert} from 'ionic-angular';
import {clientSocket, Player, Question, NotificationPromise} from '../../../services/shared-service';

@Component({
  templateUrl: 'build/pages/host/game-room/game-room.html'
})

/**
 * GameRoom - Class defines the page for the game room to display questions and player scores
 * question - Socket.io event to recieve the question from the server
 * quizEnd - Notify the host of quiz end when all the questions have been asked.
 * updateScore - Event from server to notify updated score based on question answered
 * readyForQuestion - Event notify server to ask player to get ready for next question
 * askQuestion - Function fire socket.io event to notify server to push next question
 */
export class GameRoom {
  arrPlayers: Array<Player>;
  currentQuestion: Question = new Question({
    question: ""
  });
  constructor(private navCtrl: NavController, private param: NavParams, private ngZone: NgZone) {
    this.navCtrl = navCtrl;
    this.ngZone = ngZone;
    this.arrPlayers = param.get("players");

    //Regestring event to recieve the questions
    clientSocket.on("question", (data) => {
      this.ngZone.run(() => {
        this.currentQuestion = new Question(data.question);
      });
    });
    //This event will be fired when quiz ends
    clientSocket.on("quizEnd", (data) => {
      console.log("Quiz End");
    });
    clientSocket.on("updateScore", (data) => {
      this.ngZone.run(() => {
        for (var i = 0; i < this.arrPlayers.length; i++) {
          if (this.arrPlayers[i].id == data.playerID) {
            this.arrPlayers[i].quizScore = data.playerScore
          }
        }
      });
    });
    clientSocket.on("readyForQuestion", () => {
      let alert = Alert.create({
        title: "Ask Next Questiion",
        message: "Clients ready for next question",
        buttons: ["ok"]
      });
      this.ngZone.run(() => {
        this.currentQuestion = new Question({
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: ""
        });
      });
      this.navCtrl.present(alert);
    });
  }
  askQuestion() {
    clientSocket.emit("askQuestion");
  }
}