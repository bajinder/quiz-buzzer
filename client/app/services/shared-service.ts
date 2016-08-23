
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Loading} from 'ionic-angular';

'use strict';
export var clientSocket=io('https://buzzerserver.herokuapp.com');

export class Player {
    id: String;
    name: String;
    quizScore: Number;
    isOnline:boolean;
    constructor(player:any){
        this.id=player.id
        this.name=player.Name;
        this.quizScore=player.QuizScore;
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