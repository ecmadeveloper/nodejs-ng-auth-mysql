var express = require('express'),
		jwt		 = require('express-jwt'),
		config	= require('./config'),
		db  	= require('./db'),
		quoter	= require('./quoter');

var app = module.exports = express.Router();

var jwtCheck = jwt({
	secret: config.secret
});

app.use('/api/protected', jwtCheck);

app.get('/api/protected/random-quote', function(req, res) {
	db.getUsers(function(res) {
		console.log(res);
	})
	res.status(200).send(quoter.getRandomOne());
});
