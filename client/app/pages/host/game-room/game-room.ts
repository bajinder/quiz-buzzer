import {Component,NgZone} from '@angular/core';
import {NavController,NavParams,Loading,Alert} from 'ionic-angular';
import {clientSocket, Player, Question} from '../../../services/shared-service';

@Component({
  templateUrl: 'build/pages/host/game-room/game-room.html'
})
export class GameRoom {
  arrPlayers:Array<Player>;
  currentQuestion: Question = new Question({
    question: "Question Sting "
  });
  constructor(private navCtrl: NavController,private param:NavParams,private ngZone:NgZone) {
    this.navCtrl=navCtrl;
    this.ngZone=ngZone;
    this.arrPlayers=param.get("players");

    //Regestring event to recieve the questions
    clientSocket.on("question",(data)=>{
      this.ngZone.run(()=>{
        this.currentQuestion=new Question(data.question);
      });
    });
    //This event will be fired when quiz ends
    clientSocket.on("quizEnd",(data)=>{
      console.log("Quiz End");
    });
  }
  askQuestion(){
    clientSocket.emit("askQuestion");
  }
}