import * as io from 'socket.io-client';
import {Loading} from 'ionic-angular';

export class Globals {
    public socket: any;
    constructor() {
        this.socket = io('http://localhost:3030');

    }

}