import {Component} from '@angular/core';
import {NavController, Loading, Alert, Toast} from 'ionic-angular';
import {clientSocket, NotificationPromise} from '../../../services/shared-service';
import {Buzzer} from '../buzzer-page/buzzer-page';

@Component({
  templateUrl: 'build/pages/player/player-join/player-join.html',
})
/**
 * PlayerJoin - Class let the player to join the game and define the join game page
 * abortGame - When the game is aborted 
 * playerRemoved - Notification by the server if player has been removed by the host
 * playerOffline - Notification if any player has left
 * invalidPlayer - Server notifying player of invalid playerID
 * gameStarted - event to notify player when game has started
 * joinGame - Function get called on "join game"" button press and send player ID to server for validation
 */
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
    clientSocket.on("playerRemoved", (data) => {
      console.log("removed");
      this.loading.dismiss().then(() => {
        this.isLoading = false;
        let alert = Alert.create({
          title: 'Removed',
          subTitle: 'You have been removed from game.',
          buttons: [{
            text: 'ok',
            handler: () => {
              location.reload();
            }
          }]
        });
        //Presenting the alert to user
        NotificationPromise.addAlert(alert);
        this.nav.present(alert);
      })
    });
    /*
    playerOffline - Display toast message when any player goes offline
    */
    clientSocket.on("playerOffline", (data) => {
      let toast = Toast.create({
        message: data.playerName + " left the game",
        duration: 3000
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
