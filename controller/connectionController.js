var express=require('express');
var router=express.Router();
var session = require('express-session');
var connectionDB= require('../utility/connectionDB');
var userConnectionDB = require('../utility/UserConnectionDB');
var userDB = require('../utility/UserDB');
var bodyParser= require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});
var { check, validationResult } = require('express-validator');

router.get('/',function(req,res){
  res.render('index',{user:req.session.theUser});
});

router.get('/index',function(req,res){
  res.render('index',{user:req.session.theUser});
});

router.get('/connections',async function(req,res){
  var connections = await connectionDB.getConnections();
  var categories = await connectionDB.getUniqueCategories();
    res.render('connections',{data:connections,categories:categories,user:req.session.theUser});

});

router.get('/connection',async function(req,res){
  var connectionId = req.query.connectionId;
  var user = req.session.theUser;
 if(connectionId !== undefined && connectionId !== null){
  var result = await connectionDB.getConnection(connectionId);
  if(result != null && user !=null && result.length != 0 && result[0].userID ==user.userID){
    res.render('connection',{result:result,user:user,usermodify:true});
  }else if(result != null  && result.length != 0 ){
    res.render('connection',{result:result,user:user,usermodify:false});
  }else{
    res.send('Thers is no available Connection');
  }
}else{
  var connections = await connectionDB.getConnections();
  var categories = await connectionDB.getUniqueCategories();
   res.render('connections',{data:connections,categories:categories,user:req.session.theUser});
}
});

router.get('/savedConnections',function(req, res){
  res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
});

router.get('/newConnection',function(req,res){
  res.render('newConnection',{user:req.session.theUser,error:undefined,flag:false});
});

//create a new connection
router.post('/newConnection',urlEncodedParser,[
  check('topic').matches( /^[a-zA-Z ]*$/).withMessage('Topic category must be in alphabets'),
  check('name').matches(/^[a-zA-Z ]*$/).withMessage('Name must be in alphabets'),
  check('details').isLength({ min: 10}).withMessage('Details must be length of 10'),
  check('location').matches(/(\d{0,3},)?(\d{3},)?\d{0,3}/).withMessage('Location must be alpha numeric'),
  check('date').matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).withMessage('Invalid Date format yyyy/mm/dd'),
  check('fromtime').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  check('totime').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format')
], async function(req,res){
   var errors =validationResult(req);
   var user = req.session.theUser;
  if(!errors.isEmpty()){
    res.render('newConnection',{user:req.session.theUser,error:errors.array(),flag:false})
  }else if(user == null){
    res.render('newConnection',{user:req.session.theUser,error:undefined,flag:true})
  }else{
    await userConnectionDB.addConnection(req.body,user);
    res.redirect('/connections');
 }
});



router.get('/contact',function(req,res){
  res.render('contact',{user:req.session.theUser});
});

router.get('/about',function(req,res){
  res.render('about',{user:req.session.theUser});
});


module.exports = router;
