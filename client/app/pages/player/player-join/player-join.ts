import {Component} from '@angular/core';
import {NavController, Loading, Alert,Toast} from 'ionic-angular';
import {clientSocket, NotificationPromise} from '../../../services/shared-service';
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
      NotificationPromise.clearAll(); //Aborting all the notifications to display user abort game message
      this.nav.present(abortGameAlert);

    });
    /*
    playerOffline - Display toast message when any player goes offline
    */
    clientSocket.on("playerOffline",(data)=>{
      let toast=Toast.create({
        message:data.playerName+" left the game",
        duration:3000
      });
      this.navCtrl.present(toast);
    });

    clientSocket.on("invalidPlayer", (data) => {
      //Dismiss the loader on response from server
      this.loading.dismiss().then(() => {
        this.isLoading = false;
        //Creating the alert for invalid player once the promise has been returned from controller
        let alert = Alert.create({
          title: 'Invalid player',
          subTitle: 'Please check player id with host.',
          buttons: ['ok']
        });
        //Presenting the alert to user
        NotificationPromise.addAlert(alert);
        this.nav.present(alert);
      });
    });
    clientSocket.on("gameStarted", () => {
      this.loading.dismiss().then(() => {
        this.isLoading = false;
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
    NotificationPromise.addLoading(this.loading);
    this.nav.present(this.loading);
  }
}
