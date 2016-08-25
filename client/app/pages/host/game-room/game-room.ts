import {Component, NgZone} from '@angular/core';
import {NavController, NavParams, Loading, Alert} from 'ionic-angular';
import {clientSocket, Player, Question} from '../../../services/shared-service';

@Component({
  templateUrl: 'build/pages/host/game-room/game-room.html'
})
export class GameRoom {
  arrPlayers: Array<Player>;
  currentQuestion: Question = new Question({
    question: "Question Sting "
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
      this.ngZone.run(()=>{
        for(var i=0;i<this.arrPlayers.length;i++){
          if(this.arrPlayers[i].id==data.playerID){
            this.arrPlayers[i].quizScore=data.playerScore
          }
        }
      });
    });
    clientSocket.on("readyForQuestion",()=>{
      let alert=Alert.create({
        title:"Ask Next Questiion",
        message:"Client are ready for next question",
        buttons:["ok"]
      });
      this.navCtrl.present(alert);
    });
  }
  askQuestion() {
    clientSocket.emit("askQuestion");
  }
}