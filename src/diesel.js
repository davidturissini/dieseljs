var express = require('express');
var Mustache = require('mustache');
var Q = require('q');


var port = process.env.PORT || 8888;

var app = express();

app.get('/', function (req, res) {
	res.send('foo');
	res.end();

});

app.listen(port);


console.log('Listening on port ' + port);
