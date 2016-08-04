
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Loading} from 'ionic-angular';

export class SharedService {
    public socket: any;
    public students: Array<Student>=new Array<Student>();
    constructor() {
        this.socket = io('http://localhost:3030');
        
    }
}

export class Student {
    id: String;
    name: String;
    GroupCode: String;
    quizScore: Number;
    constructor(student:any){
        this.id=student._id;
        this.name=student.StudentName;
        this.quizScore=student.QuizScore;
        this.GroupCode=student.GroupCode;
    }
    setId(id:String){
        this.id=id;
    }
    getId(){
        return this.id;
    }
    setName(name:String){
        this.name=name;
    }
    getName(){
        return this.name;
    }
    setQuizScore(score:Number){
        this.quizScore=score;
    }
    getQuizScore(){
        return this.quizScore;
    }
    setGroupCode(code:String){
        this.GroupCode=code;
    }
    getGroupCode(){
        return this.GroupCode;
    }
}