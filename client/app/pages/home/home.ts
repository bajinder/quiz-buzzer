import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {TeamCodeForm} from '../teamCodeForm/teamCodeForm';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  nav:any;
  constructor(private navCtrl: NavController) {
    this.nav=navCtrl;
  }
  teamCodeInput(){
    this.nav.push(TeamCodeForm);
  }
}
