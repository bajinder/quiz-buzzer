import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { JoinGame } from '../joinGame/joinGame';


@Component({
  templateUrl: 'build/pages/home/home.html',
})
export class HomePage {
  private objJoinGame: JoinGame;
  nav:NavController;

  constructor(navCtrl: NavController) {
    this.nav=navCtrl;
    this.socket=io('http://localhost:3030');
  }
  joinGame(){
    
    this.nav.push(JoinGame);
  }
}
