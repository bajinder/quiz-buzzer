properties = {
  username: 'user1',
  password: 'password1',
  dbName: 'buzzer_db',
  hostAddress: 'ds031995.mlab.com',
  port: 31995,
}

//constructing server address
exports.server = "mongodb://" +
                  properties.username + ":"+
                  properties.password+"@"+
                  properties.hostAddress+":"+
                  properties.port+"/"+
                  properties.dbName;


