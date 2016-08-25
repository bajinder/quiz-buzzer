import {Component, NgZone} from '@angular/core';
import {NavController, Alert, Toast, Loading} from 'ionic-angular';
import {clientSocket, Question, Player} from '../../../services/shared-service';

@Component({
  templateUrl: 'build/pages/player/buzzer-page/buzzer-page.html',
})
export class Buzzer {
  isLoading: boolean = false;
  disableOpt: boolean = true;
  loading: Loading;
  currentQuestion: Question = new Question({
    question: "Question Sting",
    optionA: "A",
    optionB: "B",
    optionC: "C",
    optionD: "D"
  });
  answer: String;
  playerScore: number = 0;
  constructor(private navCtrl: NavController, private ngZone: NgZone) {
    this.navCtrl = navCtrl;
    this.ngZone = ngZone;
    this.getReadyForQuestion();
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
    clientSocket.on("playerAnswering", (data) => {
      console.log("player Answering : " + data.playerID);

    });
    clientSocket.on("firstToPressBuzzer", (data) => {
      let alert = Alert.create({
        title: "I pressed first",
        subTitle: "yehhh",
        buttons: ['ok']
      });
      this.navCtrl.present(alert);
      this.ngZone.run(() => {
        this.disableOpt = false;
      });
    });
    clientSocket.on("answerStatus", (data) => {   //checking the answer status if it is correct then notify host to push next question
      if (data.isAnswerCorrect) {
        this.ngZone.run(() => {
          this.playerScore = data.playerScore;
        });
        let alert = Alert.create({
          title: 'Congratulation',
          message: "Correct Answer +1",
          buttons: [{
            text: 'ok',
            handler: () => {
              clientSocket.emit("confirmScoreRecieved");
            }
          }]
        });
        this.navCtrl.present(alert);
        //this.getReadyForQuestion();
      } else {
        let toast = Toast.create({
          message: "Wrong Answer",
          duration: 3000,
        });
        this.navCtrl.present(toast);
      }
    });
    //Server notifying clients to get ready for question
    clientSocket.on("readyForQuestion", () => {
      this.getReadyForQuestion();
      this.ngZone.run(() => {
        this.disableOpt = false;
      });
    });
  }

  getReadyForQuestion() {
    this.isLoading = true;
    this.loading = Loading.create({
      content: "Waiting for Question...",
    });
    this.navCtrl.present(this.loading);
  }
  buzzer() {
    clientSocket.emit("buzzer");
  }

  sendAnswer() {
    this.ngZone.run(() => {
      this.disableOpt = true;
    });
    clientSocket.emit("checkAnswer", { answer: this.answer });
  }
}
