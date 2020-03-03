var express=require('express');
var app= express();
var path = require('path');
var session = require('express-session');
app.use(session({secret:'secrectApp'}));
var viewPath = path.join(__dirname, './views');

app.set('view engine', 'ejs');
app.set('views', viewPath);

app.use('/assets', express.static('assests'));
app.use('/assets/css',express.static(path.join(__dirname,'./assets/css')));
app.use('/assets/images',express.static(path.join(__dirname,'./assets/images')));

var connectionController = require('./controller/connectionController.js');
var profileController=require('./controller/ProfileController.js');
app.use('/',connectionController);
app.use('/',profileController);


app.listen(8083);
