import {Component, NgZone} from '@angular/core';
import {Loading, NavController, Alert} from 'ionic-angular';
import {SharedService, Student} from '../../services/shared-service';
import {HostPage} from '../host-page/host-page';

@Component({
  templateUrl: 'build/pages/group-code-form/group-code-form.html',
  providers: [SharedService]
})
export class GroupCodeForm {
  nav: any;
  students: Array<Student> = new Array<Student>();
  constructor(private navCtrl: NavController, private myGlobals: SharedService, private ngZone: NgZone) {
    this.nav = navCtrl;
    this.myGlobals = myGlobals;
    this.ngZone = ngZone;
  }
  //Fetching Group members
  fetchGroupMembers(form) {
    //reffering this to obj because scope of this is confusing in callback functions
    var obj = this;
    //creating loader
    let loading = Loading.create({
      content: "Please wait...",
    });
    //Showing loader on current screen
    obj.nav.present(loading);
    //Send message to server to fetch the group members
    obj.myGlobals.socket.emit('fetchGroupMembers', { groupCode: form.controls['groupCode'].value });
    obj.myGlobals.socket.on('groupMembers', function (result) {
      while (obj.students.pop()); //removing all elements from array of students
      //fetching each record and creating student
      result.forEach(function (record) {
        obj.students.push(new Student(record));
      });
      //on successfull fetch dismiss the loader
      loading.dismiss();
      if (obj.students.length > 0) {
        //set students to global
        obj.myGlobals.students = obj.students
        //navigating to next page with parameters
        obj.nav.push(HostPage, {
          Students: obj.students
        });
        
      } else {
        //creating alert  
        obj.doAlert();
      }
    });

  }
  doAlert() {
    let alert = Alert.create({
      title: 'No Student Found!!',
      subTitle: "Please check group code. can't find students!!",
      buttons: ['OK']
    });
    this.nav.present(alert);
  }
}
