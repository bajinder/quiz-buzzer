import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { Http, Response } from '@angular/http';

@Component({
  templateUrl: 'build/pages/joinGame/joinGame.html'
})
export class JoinGame {
  constructor(private navCtrl: NavController,private http:Http) {}
  
  
}
