import {Component, NgZone} from '@angular/core';
import {NavController, Alert, Toast, Loading} from 'ionic-angular';
import {clientSocket, Question, Player} from '../../../services/shared-service';
import {ScoreBoard} from '../score-board/score-board';

@Component({
  templateUrl: 'build/pages/player/buzzer-page/buzzer-page.html',
})
export class Buzzer {
  isLoading: boolean = false;
  disableOpt: boolean = true;
  loading: Loading;
  private sound: any;
  currentQuestion: Question = new Question({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: ""
  });
  answer: String;
  playerScore: number = 0;
  private arrPlayers: Array<Player> = new Array<Player>();

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
      if (this.isLoading) {
        var players = data.players;
        for (var i = 0; i < players.length; i++) {
          this.arrPlayers.push(new Player(players[i]));
        }
        this.loading.dismiss().then(() => {
          let alert = Alert.create({
            title: "Quiz Finished",
            message: "Quiz has completed",
            buttons: [{
              text: 'ok',
              handler: () => {
                console.log(this.arrPlayers);

                this.navCtrl.push(ScoreBoard, {
                  players: this.arrPlayers
                });
              }
            }]
          });
          this.navCtrl.present(alert);
        });
      }
    });
    clientSocket.on("playerAnswering", (data) => {
      console.log("player Answering : " + data.playerID);

    });
    clientSocket.on("firstToPressBuzzer", (data) => {
      let alert = Alert.create({
        title: "You pressed first",
        subTitle: "Congratulations",
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
        this.soundPlay("media/sounds/wright_ans.mp3").play();
       
      } else {
        let toast = Toast.create({
          message: "Wrong Answer",
          duration: 3000,
        });
        this.navCtrl.present(toast);
        this.soundPlay("media/sounds/wrong_Ans.mp3").play();
        clientSocket.emit("confirmScoreRecieved");
      }
    });
    //Server notifying clients to get ready for question
    clientSocket.on("readyForQuestion", () => {
      this.getReadyForQuestion();
    });
  }

  getReadyForQuestion() {
    this.isLoading = true;
    this.answer = "";
    this.loading = Loading.create({
      content: "Waiting for Question...",
    });
    this.navCtrl.present(this.loading);
  }
  buzzer() {
    clientSocket.emit("buzzer");  //Notify server for buzzer press
    this.soundPlay("media/sounds/buzzer.mp3").play();
  }

  sendAnswer() {
    this.ngZone.run(() => {
      this.disableOpt = true;
    });
    clientSocket.emit("checkAnswer", { answer: this.answer });
  }
  soundPlay(src) {
    this.sound = new Audio(src);
    this.sound.load();
    return this.sound;
  }
}
