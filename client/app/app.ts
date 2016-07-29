import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import * as io from 'socket.io-client';

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {

  private rootPage: any;
  private socket: any;
  constructor(private platform: Platform) {
    this.rootPage = HomePage;
    this.socket = io('http://localhost:3030');
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.socket.emit('news', 'this is news', function (data) {
        console.log(data);

      });
      this.socket.on('broadcast', function (data) {
        console.log("broadcasting revcieved " + data);
      })
      this.socket.on('pb', function (d) {
        console.log('private: ' + d);
      });
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp);
