import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {GroupCodeForm} from '../group-code-form/group-code-form';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  nav:any;
  constructor(private navCtrl: NavController) {
    this.nav=navCtrl;
  }
  teamCodeInput(){
    this.nav.push(GroupCodeForm);
  }
}
