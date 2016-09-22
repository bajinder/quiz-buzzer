import {Component} from '@angular/core';
import {NavController, NavParams, Loading, Alert} from 'ionic-angular';
import {clientSocket,Player} from '../../../services/shared-service';
import {Buzzer} from '../buzzer-page/buzzer-page';


@Component({
  templateUrl: 'build/pages/player/score-board/score-board.html',
})
export class ScoreBoard {
  private arrPlayers:Array<Player>=new Array<Player>();
  constructor(private navCtrl: NavController, private param:NavParams) {
    this.navCtrl = navCtrl;
    this.arrPlayers=param.get("players");
  }
  reload(){
    location.reload();  //reloading the application
  }
}
