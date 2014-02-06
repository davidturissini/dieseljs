var express = require('express');
var pigeon = require('pigeon');
var _ = require('underscore')
var jsdom = require('jsdom');
var Q = require('q');

var routes = [];
var serverRoot = '';
var layoutsDirectory = '/layouts';
var viewsDirectory = '/views';
var defaultLayoutFileName = 'main.html';
var serverPort = 8888;
var previousTemplate = '';
var previousLayout = '';

module.exports = {

	setRenderer: function (renderer) {
		serverRenderer = renderer;
	},

	setPort: function (port) {
		serverPort = port;
	},

	setLayoutsDirectory: function (layoutsDir) {
		layoutsDirectory = layoutsDir;
	},

	setDefaultLayoutFile: function (layoutFile) {
		defaultLayoutFileName = layoutFile;
	},

	setServerRoot: function (directory) {
		serverRoot = directory;
	},

	setRoutes: function (routesData) {
		routes = routesData;
	},

	__loadLayout: function (layoutPath) {
		return pigeon.get(layoutPath);
	},

	__loadTemplate: function (templatePath) {
		return pigeon.get(templatePath);
	},


	__createDOM: function (str) {
		var defer = Q.defer();

		jsdom.env(
			str,

			[],

			function (errors, window) {
				defer.resolve(window.document);
			});

		return defer.promise;
	},

	activate: function () {

		var app = express();
		var server = this;

		routes.forEach(function (routeData) {
			app.get(routeData.path, function (req, res) {

				var layoutPath = serverRoot + layoutsDirectory + '/' + defaultLayoutFileName;
				var doc;
				
				server.__loadLayout(layoutPath)

					.then(function (data) {
						return server.__createDOM(data.toString());
					})

					.then(function (document) {
						doc = document;
						return server.__loadTemplate(routeData.template);
					})

					.then(function (templateHTML) {
						doc.querySelector('.content').innerHTML = templateHTML;
						return routeData.action(doc, req.params);
					})

					.then(function () {
						res.write(doc.innerHTML);
						res.end();
					})


				
				
			});
		});

		app.use(express.static(serverRoot));

		app.listen(serverPort);

		console.log('Listening on port ' + serverPort);

	}

}