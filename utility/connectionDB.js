var Connection = require('./../models/Connection');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/events', {useNewUrlParser: true});
var db = mongoose.connection;
var Schema = mongoose.Schema;

var connectionsSchema =  new Schema({
  connectionID: {type:String, required:true},
  userID:{type:String, required:true},
  connectionName: {type:String, required:true},
  connectionTopic: {type:String, required:true},
  details: {type:String, required:true},
  location: {type:String, required:true},
  date: {type:String, required:true},
  time: String,
});

var connectionModel = mongoose.model('connections', connectionsSchema);

//Get all connections from Db
function getConnections() {
    return new Promise(resolve =>{
          resolve(connectionModel.find({}).then(function(connections){
            return connections;
          })
        );
      });
};

// Get a connection from Db
function getConnection(connectionID){
  return new Promise(resolve =>{
        resolve(connectionModel.find({"connectionID":connectionID}).then(function(connection){
          return connection;
        })
      );
    });
}

function getUniqueCategories(){
  return new Promise(resolve =>{
        resolve(connectionModel.distinct("connectionTopic").then(function(categories){
          return categories;
        })
      );
    });
}

//Upadate a connection in Db
function updateConnection(userID,connection){
  var fromtime =gettime(connection.fromtime);
  var totime = gettime (connection.totime);
  var eventTime = fromtime +"-"+totime;
  date = new Date(connection.date);
  var eventDate = monthNumToName(date);
  var connection = {"connectionID":connection.connectionID,"connectionName":connection.name,"connectionTopic":connection.topic,"details":connection.details,"location":connection.location,"date":eventDate,"time":eventTime};
  return new Promise(resolve =>{
       resolve(connectionModel.updateOne({connectionID:connection.connectionID, userID:userID},connection).then(function(data){
       return data;
        })
      );
    });
}

//delete a connection in Db
function deleteConnection(connectionID,userID){
  return new Promise(resolve =>{
        resolve(connectionModel.deleteOne({connectionID:connectionID, userID:userID}).then(function(data){
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
module.exports={
  getUniqueCategories:getUniqueCategories,
  getConnections:getConnections,
  getConnection:getConnection,
  updateConnection:updateConnection,
  deleteConnection:deleteConnection,
}
