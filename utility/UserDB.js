var User = require('../models/User');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/events', {useNewUrlParser: true});
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userID: {type:String, required:true},
  firstName: {type:String, required:true},
  lastName: {type:String, required:true},
  email: {type:String, required:true},
  password:{type:String, required:true},
  salt:{type:String, required:true}
});
var userModel = mongoose.model('users', userSchema);

//Get all users from DB
function getUsers(){
  return new Promise(resolve =>{
        resolve(userModel.find({}).then(function(users){
          return users;
        })
      );
    });
}

function getUser(userID){
  return new Promise(resolve =>{
        resolve(userModel.find({userID:userID}).then(function(user){
          return user;
        })
      );
    });
}

//To get user details from DB
function getUserProfile(userName,password){
  return new Promise(resolve =>{
        resolve(userModel.findOne({email:userName}).then(function(user){
          return user;
        })
      );
    });
}

//add a new user to dB
function addUser(user,password,salt){
  var id = '12ME0';
  id += Math.floor(Math.random() * 107) + 7;
  var newUser = {"userID":id,"firstName":user.firstName,"lastName":user.lastName,"email":user.email,"password":password,"salt":salt};
  return new Promise(resolve =>{
        resolve(userModel.collection.insertOne(newUser).then(function(data){
          return newUser;
        })
      );
    });
}

module.exports= {
  getUsers:getUsers,
  getUserProfile:getUserProfile,
  addUser:addUser,
};
