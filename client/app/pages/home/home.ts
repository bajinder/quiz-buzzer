import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {PlayerJoin} from '../player/player-join/player-join';
import {PlayersAdd} from '../host/add-player/add-player';


@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  nav: any;
  private sound: any;
  constructor(private navCtrl: NavController) {
    this.nav = navCtrl;
    var homeSound="media/sounds/home.mp3";
    //this.soundPlay(homeSound).play();

    
    
  }
  goToHost() {
    this.nav.push(PlayersAdd);
  }
  playerJoin() {
    console.log("playerJoin");
    this.nav.push(PlayerJoin);
  }
  soundPlay(src) {
    this.sound = new Audio(src);
    this.sound.load();
    return this.sound;
  }
}