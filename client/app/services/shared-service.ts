
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Loading,Alert,NavController} from 'ionic-angular';


'use strict';
//export var clientSocket=io('https://buzzerserver.herokuapp.com'); //Uncomment for Heroku server
export var clientSocket=io('http://localhost:3030');    //For local server
export var NotificationPromise={
    alert:null,
    loading:null,
    addAlert:function(alert:Alert){
        this.alert=alert
    },
    addLoading:function(loading:Loading){
        this.loading=loading;
    },
    clearAll:function(){
        if(this.alert!=null){
            this.alert.dismiss();
        }
        if(this.loading!=null){
            this.loading.dismiss();
        }
    }
};

export class Player {
    id: String;
    name: String;
    quizScore: Number;
    isOnline:boolean;
    constructor(player:any){
        this.id=player.playerID;
        this.name=player.playerName;
        this.quizScore=player.quizScore;
        this.isOnline=false;
    }
}

export class Question{
    question:String;
    optionA:String;
    optionB:String;
    optionC:String;
    optionD:String;
    constructor(questionData:any){
        this.question=questionData.question;
        this.optionA=questionData.optionA;
        this.optionB=questionData.optionB;
        this.optionC=questionData.optionC;
        this.optionD=questionData.optionD;
    }
}