import {Component} from '@angular/core';
import {NavController,NavParams} from 'ionic-angular';
import {Student} from '../../services/shared-service';

@Component({
  templateUrl: 'build/pages/host-page/host-page.html'
})
export class HostPage {
  students:Array<Student>;
  constructor(private navCtrl: NavController, private params: NavParams) {
    this.students=params.get("Students");
    console.log(this.students);
  }
}
