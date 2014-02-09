var Q = require('q');

var statelessRoutes = [];

var serverDelegate = require('./server/backbone');
if (process.browser !== true) {
	serverDelegate = require('./server/' + 'express');
}


var stateless = {

	setAnalytics: function (analytics) {
		serverDelegate.setAnalytics(analytics);
		return this;
	},

	setRenderer: function (renderer) {
		serverDelegate.setRenderer(renderer);
		return this;
	},

	setPort: function (port) {
		serverDelegate.setPort(port);
		return this;
	},

	setLayoutsDirectory: function (layoutsDir) {
		serverDelegate.setLayoutsDirectory(layoutsDir);
		return this;
	},

	setDefaultLayoutFile: function (layoutFile) {
		serverDelegate.setDefaultLayoutFile(layoutFile);
		return this;
	},

	setServerRoot: function (rootDir) {
		serverDelegate.setServerRoot(rootDir);
		return this;
	},

	setRoutes: function (routes) {
		serverDelegate.setRoutes(routes);
		return this;
	},

	activate: function () {
		serverDelegate.activate();
		return this;
	}

}


module.exports = stateless;