var mysql = require('mysql'),
	md5 = require('md5'),
	config	= require('./config'),
	_   = require('lodash'),
	jwt = require('jsonwebtoken');

var connection = mysql.createConnection({
	host	 : 'localhost',
	user	 : 'root',
	password : 'root',
	database : 'portal_dev'
});

function createToken(user) {
	params = _.omit(user, 'password');
	return jwt.sign(_.omit(params, 'access_token'), config.secret, { expiresInMinutes: 60*5 });
}

connection.connect(function(err) {
	if (err) throw err;
});

Date.prototype.getFromFormat = function(format) {
    var yyyy = this.getFullYear().toString();
    format = format.replace(/yyyy/g, yyyy)
    var mm = (this.getMonth()+1).toString(); 
    format = format.replace(/mm/g, (mm[1]?mm:"0"+mm[0]));
    var dd  = this.getDate().toString();
    format = format.replace(/dd/g, (dd[1]?dd:"0"+dd[0]));
    var hh = this.getHours().toString();
    format = format.replace(/hh/g, (hh[1]?hh:"0"+hh[0]));
    var ii = this.getMinutes().toString();
    format = format.replace(/ii/g, (ii[1]?ii:"0"+ii[0]));
    var ss  = this.getSeconds().toString();
    format = format.replace(/ss/g, (ss[1]?ss:"0"+ss[0]));
    return format;
};


connection.getUsers = function(callback) {
	connection.query('SELECT * FROM users',
		function (err, result) {
			if (err) throw err;
			if (typeof callback === "function") {
				callback(result);
			}
		}
	);
};

connection.findUser = function(params, callback) {
	var username = params.username || "";
	connection.query("SELECT * FROM users WHERE `username`=" + mysql.escape(username),
		function(err, result) {
			if (err) throw err;

			if (typeof callback === "function") {
				callback(result);
			}
		}
	);
}

connection.verifyLogin = function(username, password, callback) {
	connection.findUser({username: username}, function(result) {
		user = [];
		if (result.length > 0) {
			var savedPassword = md5(result[0].salt + password);
			if (savedPassword == result[0].password) {
				result[0].access_token = createToken(user);
				user = result;
			}
		}
		if (typeof callback === "function") {
			callback(user);
		}
	})
}

connection.createUser = function(params, callback) {
	if (!params.username || !params.password) {
		callback();
	} else {
		params.salt = Math.random().toString(36).slice(-8);
		d = new Date();
		var date = d.getFromFormat('yyyy-mm-dd hh:ii:ss');
		var query = 'INSERT INTO users(' +
							'username,' +
							'salt,' +
							'password,' +
							'created_at,' +
							'updated_at) ' +
					'VALUES(\'' + 
					params.username + '\', \'' +
					params.salt + 
					'\', md5(\'' + params.salt + params.password + '\'), \'' +
					date + '\', \'' + date + '\')';

		connection.query(query,
			function (err, result) {
				if (err) throw err;
				if (typeof callback === "function") callback(result);
			}
		);
	}
}

connection.updateToken = function(params, callback) {
	var data = {access_token: createToken(params)};
	if (typeof callback === "function") {
		callback();
	}
}

connection.updateUser = function(params, callback) {
	var d = new Date(),
		date = d.getFromFormat('yyyy-mm-dd hh:ii:ss');
	var data = {
		first_name: params.first_name,
		last_name: params.last_name,
		email: params.email,
		updated_at: date
	};
	if (!params.password) {
		var salt = Math.random().toString(36).slice(-8);
		data.salt = salt;
		data.password = md5(salt + params.password);
	}
	if (!params.username) {
		data.username = params.username;
	}
	// connection.query('UPDATE user SET ? WHERE ?', data)
	if (typeof callback === "function") {
		callback();
	}
}

module.exports = connection;