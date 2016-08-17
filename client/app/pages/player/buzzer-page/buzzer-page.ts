import {Component, NgZone} from '@angular/core';
import {NavController, Alert, Toast, Loading} from 'ionic-angular';
import {clientSocket, Question} from '../../../services/shared-service';

@Component({
  templateUrl: 'build/pages/player/buzzer-page/buzzer-page.html',
})
export class Buzzer {
  nav: NavController;
  isLoading: boolean = false;
  loading: Loading
  currentQuestion: Question = new Question({
    question: "Question Sting",
    optionA: "A",
    optionB: "B",
    optionC: "C",
    optionD: "D"
  });
  constructor(private navCtrl: NavController, private ngZone: NgZone) {
    this.nav = navCtrl;
    this.ngZone = ngZone;
    this.waitingForHost();
    //Regestring event to recieve the questions
    clientSocket.on("question", (data) => {
      if (this.isLoading) {
        this.loading.dismiss().then(() => {
          this.isLoading = false;
        });
      }
      this.ngZone.run(() => {
        this.currentQuestion = new Question(data.question);
      });
    });
    //This event will be fired when quiz ends
    clientSocket.on("quizEnd", (data) => {
      console.log("Quiz End");
    });
    clientSocket.on("playerAnswering",(data)=>{
      console.log("player Answering : "+data.playerID);
      
    });
  }
  waitingForHost() {
    this.isLoading = true;
    this.loading = Loading.create({
      content: "Waiting for first Question...",
    });
    this.navCtrl.present(this.loading);
  }
  buzzer() {
    clientSocket.emit("buzzer");
  }
}
