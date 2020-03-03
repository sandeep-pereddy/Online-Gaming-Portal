var UserConnection = require('./UserConnection');
var connection = require('./connection');
var userConnectionDB = require('../utility/UserConnectionDB');
var connectionDB= require('../utility/connectionDB');

class UserProfile {
   constructor(user) {
    this.User=user;
    this.userConnectionList=[];
  }


 async addConnection(connection,rsvp){
 var data = await userConnectionDB.addRSVP(connection.connectionID,this.User.userID,rsvp);
}

async removeConnection(connection){
 await userConnectionDB.deleteConnection(connection.connectionID,this.User.userID);
}

async updateConnection(userConnection){
 await userConnectionDB.updateRSVP(userConnection.Connection.connectionID,this.User.userID,userConnection.rsvp);
}

 getConnections() {
 return this.userConnectionList;
}

 emptyProfile(){
  this.userConnectionList = [];
  this.User = null;
}


 async addUserConnections(userID){
  var userConnectionList =[];
  var userConnections = await userConnectionDB.getUserProfile(userID);
  for(var i=0 ; i< userConnections.length; i++){
    var connection= await connectionDB.getConnection(userConnections[i].connectionID);
    var rsvp = userConnections[i].rsvp;
    var userConnection = new UserConnection(connection[0],rsvp);
   userConnectionList.push(userConnection);
 }
  return userConnectionList
}

checkExistingConnection(connectionId){
  var connectionExists = 0;
  for(var i=0; i< this.userConnectionList.length; i++ ){
    if(this.userConnectionList[i].Connection.connectionID === connectionId){
      connectionExists = 1;
    }
  }
  return connectionExists ;
}

 getConnection(connectionId){
  var connection;
  if(this.userConnectionList[i].connection.connectionID === connectionId){
    connection = this.userConnectionList[i].connection;
  }
  return connection;
}
}



module.exports = UserProfile;
