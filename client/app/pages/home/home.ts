import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {PlayerJoin} from '../player/player-join/player-join';
import {PlayersAdd} from '../host/add-player/add-player';


@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  nav: any;
  constructor(private navCtrl: NavController) {
    this.nav = navCtrl;

  }
  goToHost() {
    this.nav.push(PlayersAdd);
  }
  playerJoin() {
    console.log("playerJoin");
    this.nav.push(PlayerJoin);
  }
}