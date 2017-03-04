var express = require('express'),
		db			= require('./db');

var app = module.exports = express.Router();

// XXX: This should be a database of users :).
var users = [{
	id: 1,
	username: 'gonto',
	password: 'gonto'
}];

app.post('/users', function(req, res) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).send("You must send the username and the password");
	}
	db.findUser({username: req.body.username}, function(result) {
		if (result.length > 0) {
			return res.status(400).send("A user with that username already exists");
		}
	});
	// if (_.find(users, {username: req.body.username})) {
	//  return res.status(400).send("A user with that username already exists");
	// }

	// var profile = _.pick(req.body, 'username', 'password', 'extra');
	// profile.id = _.max(users, 'id').id + 1;

	// users.push(profile);

	db.createUser(req.body, function(result) {
		res.status(201).send({
			id_token: createToken(req.body)
		});
	});
});

app.post('/sessions/create', function(req, res) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).send("You must send the username and the password");
	}

	// var user = _.find(users, {username: req.body.username});
	// if (!user) {
	// 	return res.status(401).send("The username or password don't match");
	// }

	// if (!(user.password === req.body.password)) {
	// 	return res.status(401).send("The username or password don't match");
	// }
	db.verifyLogin(req.body.username, req.body.password, function(result) {
		if (result.length > 0) {
			res.status(201).send(result);
		} else {
			return res.status(401).send("The username or password don't match");
		}
	})

		
});