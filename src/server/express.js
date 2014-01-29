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
var serverRenderer = require('./../renderer/weld');

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

	activate: function () {

		var app = express();

		routes.forEach(function (routeData) {
			app.get(routeData.path, function (req, res) {
				routeData.action().then(function (actionData) {
					var template = actionData.template;


					pigeon.get(serverRoot + layoutsDirectory + '/' + defaultLayoutFileName)
						.then(function (data) {
							var defer = Q.defer();
							var layoutString = data.toString();

							jsdom.env(
								layoutString,

								[],

								function (errors, window) {
									window.document.querySelector('.contents').innerHTML = template;
									var str = serverRenderer.render(window.document, actionData);
									defer.resolve(str);
								});

							return defer.promise;
							
						})

						.then(function (document) {
							res.write(document.innerHTML);
							res.end();
						})
				});
				
			});
		});

		app.use(express.static(serverRoot));

		app.listen(serverPort);

		console.log('Listening on port ' + serverPort);

	}

}