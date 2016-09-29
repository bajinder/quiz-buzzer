import {Component, NgZone} from '@angular/core';
import {NavController, Toast, Alert, Loading} from 'ionic-angular';
import {clientSocket, Player} from '../../../services/shared-service';
import {GameRoom} from '../game-room/game-room';

@Component({
  templateUrl: 'build/pages/host/add-player/add-player.html'
})
export class PlayersAdd {
  playerId: String;
  arrPlayers: Array<Player> = new Array<Player>();
  startButtonDisabled: boolean = true;
  loader: Loading;
  private onlineSound: any;
  private sound: any;
  constructor(private navCtrl: NavController, private ngZone: NgZone) {
    this.navCtrl = navCtrl;
    this.ngZone = ngZone;
    clientSocket.emit("iAmHost"); //Notify server about host
    clientSocket.on("addPlayerResponse", (data) => {
      console.log(data.isPlayerValid);
      if (data.isPlayerValid) {
        this.ngZone.run(() => {
          this.arrPlayers.push(new Player(data.playerInfo));
          this.playerId = "";
          this.checkAllPlayersOnline();   //Checking if all the players are online
        });
        this.loader.dismiss();
      } else {
        this.loader.dismiss().then(() => {
          this.playerInvalidAlert()
        });
      }

    });
    /**playerOnline - this will mark the player online */
    clientSocket.on("playerOnline", (data) => {
      this.ngZone.run(() => {
        for (var i = 0; i < this.arrPlayers.length; i++) {
          if (this.arrPlayers[i].id == data.playerID) {
            this.arrPlayers[i].isOnline = true;
            this.soundPlay("media/sounds/online.mp3").play();
          }
        }
        this.checkAllPlayersOnline();   //Checking if all the players are online
      });
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
      this.ngZone.run(() => {
        for (var i = 0; i < this.arrPlayers.length; i++) {
          if (this.arrPlayers[i].id == data.playerID) {
            this.arrPlayers[i].isOnline = false;
          }
        }
        this.checkAllPlayersOnline();   //Checking if all the players are online
      });
    });
    /**emptyRoom - This is to notify host that all the players have left */
    clientSocket.on("roomEmpty", (data) => {
      let alert = Alert.create({
        title: 'Players Left',
        subTitle: 'All the players in room has left',
        buttons: [{
          text: 'ok',
          handler: () => {
            location.reload();  //reloading the application
          }
        }]
      });
      this.navCtrl.present(alert);
    });
    clientSocket.on("playerAddedInOtherRoom", (data) => {
      this.loader.dismiss().then(() => {
        let alert = Alert.create({
          title: 'Invalid player',
          subTitle: 'Player already playing in some room.',
          buttons: ['ok']
        });
        this.navCtrl.present(alert);
      });
    });
  }
  addPlayer() {
    if ((this.playerId == null) || (this.playerId == "")) {
      this.playerIdBlankAlert();
    } else {
      clientSocket.emit("addPlayer", { playerID: this.playerId });
      this.loader = Loading.create({
        content: "Validating player...",
      });
      this.navCtrl.present(this.loader);
    }
  }
  startGame() {
    clientSocket.emit("prepareQuestions");    //Notofying server to prepare questions for the room from database
    clientSocket.emit("startingGame");
    this.navCtrl.push(GameRoom, {
      players: this.arrPlayers
    });
  }
  checkAllPlayersOnline() {
    for (var i = 0; i < this.arrPlayers.length; i++) {
      if (this.arrPlayers[i].isOnline) {
        this.startButtonDisabled = false;
      } else {
        this.startButtonDisabled = true;
        break;
      }
    }
  }
  playerIdBlankAlert() {
    let toast = Toast.create({
      message: "Player id is blank",
      duration: 3000,
      position: "top"
    });
    this.navCtrl.present(toast);
  }
  playerInvalidAlert() {
    let toast = Toast.create({
      message: "Player id is not valid",
      duration: 3000,
      position: "top"
    });
    this.navCtrl.present(toast);
  }
  soundPlay(src) {
    this.sound = new Audio(src);
    this.sound.load();
    return this.sound;
  }
  removePlayer(playerID) {
    this.ngZone.run(() => {
      for (var i = 0; i < this.arrPlayers.length ; i++) {
        if (this.arrPlayers[i].id == playerID) {
          this.arrPlayers.splice(i,1);
          break;
        }
      }
    });
    console.log(this.arrPlayers);
    clientSocket.emit("removePlayer", { playerID: playerID });
  }
}
