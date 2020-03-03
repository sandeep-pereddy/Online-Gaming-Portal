var express=require('express');
var router=express.Router();
var bodyParser= require('body-parser');
var session = require('express-session');
var urlEncodedParser = bodyParser.urlencoded({extended: false});
var { check, validationResult } = require('express-validator');
var crypto = require('crypto');
var userDB= require('../utility/UserDB');
var UserProfile = require('../models/UserProfile');
var connectionDB = require('../utility/connectionDB');
var userConnectionDB = require('../utility/UserConnectionDB');
var UserConnection = require('../models/UserConnection');

var userProfile;
router.use( (req, res, next) => {
 res.locals.user = req.session.theUser;
 next();
});

router.get('/login',function(req,res){
  res.render('login',{valid:false,error:undefined,user:undefined});
});

// user login functionality
router.post('/login',urlEncodedParser,[
  check('email').isEmail().withMessage('username must be a email'),
  check('password').isLength({ min: 8, max: 20})
  .withMessage('Password must be between 8-20 characters long.')
  .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
  .withMessage('Password must include lowercase,uppercase,number & special character.')
], async function(req,res){
   var errors =validationResult(req);
   if(!errors.isEmpty()){
     res.render('login',{valid:false,error:errors.array(),user:undefined})
   }else if(!req.session.theUser){
    var userName = req.body.email;
    var password = req.body.password;
    var user = await userDB.getUserProfile(userName);
    if(user != null && user.password == saltHashPassword(password,user.salt)){
      req.session.theUser = user;
      userProfile = new UserProfile(user);
      var userConnections = await userProfile.addUserConnections(user.userID);
      userProfile.userConnectionList= userConnections;
      req.session.userProfile = userProfile;
      res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
    }else{
      res.render('login',{valid:true,error:undefined,user:undefined});
    }
  }else{
    res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
  }
});

//user logout functionality
router.get('/signout',function(req,res){
 if(req.session.theUser){
   userProfile.emptyProfile();
   req.session.destroy();
   res.redirect('/');
 }else{
    res.redirect('/');
 }

});


//changes to user connections by using save,update, delete functionalities of user profile
router.post('/savedConnections',urlEncodedParser, async function(req, res){
  if(req.body.action== undefined){
    res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
  }else if(req.session.theUser == undefined){
    res.render('index',{user:req.session.theUser});
  }else{
    var connectionId = req.query.connectionId;
    var rsvp = req.query.rsvp;
    var action = req.body.action;
    var connection = await connectionDB.getConnection(connectionId);
    if(action == 'save'){
      var existingConnection = userProfile.checkExistingConnection(connectionId);
      if(existingConnection == 0){
        await  userProfile.addConnection(connection[0],rsvp);
        var userConnections = await userProfile.addUserConnections(req.session.theUser.userID);
        userProfile.userConnectionList= userConnections;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }else{
        var  userconnection = new UserConnection(connection[0],rsvp);
        await userProfile.updateConnection(userconnection);
        var userConnections = await userProfile.addUserConnections(req.session.theUser.userID);
        userProfile.userConnectionList= userConnections;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }
    }else if(action == 'delete'){
      var existingConnection = userProfile.checkExistingConnection(connectionId);
      if(existingConnection == 1){
        await userProfile.removeConnection(connection[0]);
        var userConnections = await userProfile.addUserConnections(req.session.theUser.userID);
        userProfile.userConnectionList= userConnections;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }else{
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }
    }
  }
});

router.get('/signup',function(req,res){
 res.render('signup',{user:req.session.theUser,error:undefined});
});

//creat a new user profile
router.post('/signup',urlEncodedParser,[
  check('firstName').matches( /^[a-zA-Z ]*$/).withMessage('FirstName must be in alphabets'),
  check('lastName').matches(/^[a-zA-Z ]*$/).withMessage('LastName must be in alphabets'),
  check('email').isEmail().withMessage('Enter valid Email'),
  check('password').isLength({ min: 8, max: 20})
  .withMessage('Password must be between 8-20 characters long.')
  .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i')
  .withMessage('Password must include lowercase,uppercase,number & special character.')
 ],async function(req,res){
   var errors =validationResult(req);
   if(!errors.isEmpty()){
     res.render('signup',{error:errors.array(),user:undefined})
   }else{
     var salt = getSalt();
     var hashPassword =saltHashPassword(req.body.password,salt);
     var user = await userDB.addUser(req.body,hashPassword,salt);
     req.session.theUser = user;
     userProfile = new UserProfile(user);
     userProfile.userConnectionList= [];
     req.session.userProfile = userProfile;
     res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
 }
});

router.get('/updateUserConnection',async function(req,res){
  var connectionId = req.query.connectionId;
  var result = await connectionDB.getConnection(connectionId);
  res.render('updateConnection',{user:req.session.theUser,result:result,error:undefined})
})

//update a connection created by user
router.post('/updateConnection',urlEncodedParser,[
check('topic').matches( /^[a-zA-Z ]*$/).withMessage('Topic category must be in alphabets'),
check('name').matches(/^[a-zA-Z ]*$/).withMessage('Name must be in alphabets'),
check('details').isLength({ min: 10}).withMessage('Details must be length of 10'),
check('location').matches(/(\d{0,3},)?(\d{3},)?\d{0,3}/).withMessage('Location must be length of 5'),
check('date').matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).withMessage('Invalid Date format yyyy/mm/dd'),
check('fromtime').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
check('totime').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format')
],async function(req,res){
  var user = req.session.theUser;
  if(user != null){
    await connectionDB.updateConnection(user.userID,req.body);
    res.redirect('/connections');
  }
})

//delete a connection created by user
router.post('/deleteConnection',urlEncodedParser,async function(req,res){
  var user = req.session.theUser;
  var connectionId = req.query.connectionId;
  if(user != null && connectionId !=null ){
    await connectionDB.deleteConnection(connectionId,user.userID);
    await userConnectionDB.removeConnectionInUsers(connectionId);
    var userConnections = await userProfile.addUserConnections(user.userID);
    userProfile.userConnectionList= userConnections;
    req.session.userProfile = userProfile;
    res.redirect('/connections');
  }
})

// Salt hashing the password
function saltHashPassword(password,salt){
  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  var hashPassword = hash.digest('hex');
  return hashPassword;
}

// used to generated the salt
function getSalt(){
  var salt = crypto.randomBytes(8).toString('hex') .slice(0,16);
  return salt;
}

router.get('/*',function(req,res){
    res.send('Invalid URL');
});

module.exports = router;
