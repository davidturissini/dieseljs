var express = require('express');
var Mustache = require('mustache');
var Q = require('q');


var port = process.env.PORT || 8888;
var dieselRoutes = [];




console.log('Listening on port ' + port);

var diesel = {
	setRoutes: function (routes) {

		dieselRoutes = routes;
		return this;

	},

	activate: function () {

		var app = express();

		dieselRoutes.forEach(function (routeData) {
			app.get(routeData.path, routeData.handler);
		});

		app.listen(port);

	}
}


module.exports = diesel;