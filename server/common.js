var config = require('./config.js')
var mongodb = require('mongodb');
var MongoClient = require("mongodb").MongoClient;

var mongo = {
    mongo: mongodb,
    db: null,
    collection:null
}

//mLab connectivity options
var options = {
    server: { auto_reconnect: true, socketOptions: { keepAlive: 1, connectTimeoutMS: 300000, socketTimeoutMS: 0 } },
    db: { native_parser: true, w: 0 }
}

//this function is to initialize the connection with mongolab
mongo.init = function () {
    //connecting with mongo on mLab
    MongoClient.connect(config.server, options, function (err, db) {
        if (err) {  //if connection failed
            console.log('Error opening or authenticating mongolab database')
        }
        else {
            //On successfull connection we get the db and collection refrences
            console.log('DB connection successfull');
            mongo.db = db;
            mongo.collection=db.collection("logs");
        }
    });
}
exports.mongo=mongo;


