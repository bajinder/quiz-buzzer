import {Component} from '@angular/core';
import {Loading, NavController} from 'ionic-angular';
import {Globals} from '../../globals';
@Component({
  templateUrl: 'build/pages/teamCodeForm/teamCodeForm.html',
  providers: [Globals]
})
export class TeamCodeForm {
  nav: any;
  constructor(private navCtrl: NavController, private myGlobals: Globals) {
    this.nav = navCtrl;
    this.myGlobals = myGlobals;
  }
  //Fetching team members
  fetchTeamMembers(form) {
    //creating loader
    let loading = Loading.create({
      content: "Please wait...",
    });
    //Showing loader on current screen
    this.nav.present(loading);
    //Send message to server to fetch the team members
    this.myGlobals.socket.emit('fetchTeamMembers', { teamCode: form.controls['teamCode'].value });
    this.myGlobals.socket.on('teamMembers', function (data) {
      //on successfull fetch dismiss the loader
      loading.dismiss();
      console.log(data);
    })
  }
}
