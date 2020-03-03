var mongoose = require('mongoose');
var connectionDB = require('../utility/connectionDB');
mongoose.connect('mongodb://localhost:27017/events', {useNewUrlParser: true});
var db = mongoose.connection;
var Schema = mongoose.Schema;

var userConnectionSchema = new Schema({
  userID: {type:String, required:true},
  connectionID: {type:String, required:true},
  rsvp:{type:String, required:true},
});

var userConnectionModel = mongoose.model('userconnections', userConnectionSchema);
var connectionModel = mongoose.model('connections',connectionDB.connectionsSchema)

function getUserProfile(userID){
  return new Promise(resolve =>{
        resolve(userConnectionModel.find({userID: userID}).then(function(userConnections){
          return userConnections;
        })
      );
    });
}

//Add a user connection in DB
function addRSVP(connectionID, userID, rsvp,connection){
  var userConnection = {"userID":userID,"connectionID":connectionID,"rsvp":rsvp};
  return new Promise(resolve =>{
        resolve(userConnectionModel.collection.insertOne(userConnection).then(function(data){
          return data;
        })
      );
    });
}

//update a user connection in Db
function updateRSVP(connectionID, userID, rsvp){
  var userConnection = {"userID":userID,"connectionID":connectionID,"rsvp":rsvp};
  return new Promise(resolve =>{
        resolve(userConnectionModel.updateOne({connectionID:connectionID, userID:userID},userConnection).then(function(data){
          return data;
        })
      );
    });
}

//delete a user connection in Db
function deleteConnection(connectionID, userID){
  return new Promise(resolve =>{
        resolve(userConnectionModel.deleteOne({connectionID:connectionID, userID:userID}).then(function(data){
          return data;
        })
      );
    });
}

//Add a new connection in Db
function addConnection(connection,user){
  var id = 'GMEL';
  id += Math.floor(Math.random() * 107) + 7;
  var fromtime =gettime(connection.fromtime);
  var totime = gettime (connection.totime);
  var eventTime = fromtime +"-"+totime;
  date = new Date(connection.date);
  var eventDate = monthNumToName(date);
  if(user){
    var newConnection = {"connectionID":id,"userID":user.userID,"connectionName":connection.name,"connectionTopic":connection.topic,"details":connection.details,"location":connection.location,"date":eventDate,"time":eventTime};
  }else{
    var newConnection = {"connectionID":id,"userID":"null","connectionName":connection.name,"connectionTopic":connection.topic,"details":connection.details,"location":connection.location,"date":eventDate,"time":eventTime};
  }
  return new Promise(resolve =>{
        resolve(connectionModel.collection.insertOne(newConnection).then(function(data){
          return data;
        })
      );
    });
}

//Remove connection from all users profiles in DB
function removeConnectionInUsers(connectionID){
  return new Promise(resolve =>{
        resolve(userConnectionModel.deleteMany({connectionID:connectionID}).then(function(data){
          return data;
        })
      );
    });
}

function monthNumToName(date) {

var months = ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September','October', 'November', 'December'];
var con =1;
var monthNumber =date.getMonth();
var day = date.getDate()+con
var month = months[monthNumber]
var formatDate= month +" "+ day +" "+date.getFullYear();
return formatDate;
}

function gettime (time){
  var minutes = time.split(":");
  var hours = parseInt(time)
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  var strTime = hours +':' + minutes[1] +' '+ ampm;
  return strTime;
}


module.exports= {
  getUserProfile:getUserProfile,
  addRSVP:addRSVP,
  updateRSVP:updateRSVP,
  deleteConnection:deleteConnection,
  addConnection:addConnection,
  removeConnectionInUsers:removeConnectionInUsers,
};
