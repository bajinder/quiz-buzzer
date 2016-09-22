import {Component} from '@angular/core';
import {NavController, Loading, Alert} from 'ionic-angular';
import {clientSocket} from '../../../services/shared-service';
import {Buzzer} from '../buzzer-page/buzzer-page';

@Component({
  templateUrl: 'build/pages/player/player-join/player-join.html',
})
export class PlayerJoin {
  nav: NavController;
  loading: Loading;
  isLoading: boolean = false;
  constructor(private navCtrl: NavController) {
    this.nav = navCtrl;
    clientSocket.on("abortGame", () => {
      let abortGameAlert = Alert.create({
        title: "Game Abort",
        subTitle: "Host disconnected. Aborting game!!!",
        buttons: [{
          text: 'Ok',
          handler: () => {
            location.reload();  //reloading the application
          }
        }]
      });
      if (this.isLoading) {
        this.loading.dismiss().then(() => {
          this.navCtrl.present(abortGameAlert);
        })
      }else {
        this.navCtrl.present(abortGameAlert);
      }
    });
    clientSocket.on("invalidPlayer", (data) => {
      //Dismiss the loader on response from server
      this.loading.dismiss().then(() => {
        this.isLoading=false;
        //Creating the alert for invalid player once the promise has been returned from controller
        let alert = Alert.create({
          title: 'Invalid player',
          subTitle: 'Please check player id with host.',
          buttons: ['ok']
        });
        //Presenting the alert to user
        this.nav.present(alert);
      });
    });
    clientSocket.on("gameStarted", () => {
      this.loading.dismiss().then(() => {
        this.isLoading=false;
        this.nav.push(Buzzer);
      })
    });
  }
  x
  join(form) {
    var pID = form.controls['playerID'].value;
    clientSocket.emit("joinGame", { playerID: pID });
    this.loading = Loading.create({
      content: "Wait..."
    });
    this.isLoading = true;
    this.nav.present(this.loading);
  }
}
