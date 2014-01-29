var Backbone = require('backbone');
var _ = require('underscore');
var jquery = require('jquery');
var Q = require('q');
Backbone.$ = jquery;

var routes = [];
var layoutsDirectory = '/layouts';
var defaultBehavior = 'push';
var defaultLayoutFileName = 'main.html';
var pigeon = require('pigeon');
var currentLayoutPath = '';
var serverRenderer = require('./../renderer/weld');
var previousTemplate = '';
var previousLayout = '';
var lastData = {};

function navigate (router, e) {
	var behavior = e.currentTarget.getAttribute('data-behavior');
	var navigationOptions = {
		trigger:true
	}

	if (behavior === 'ignore') {
		return;
	}

	e.preventDefault();

	if (!behavior) {
		behavior = defaultBehavior;
	}

	navigationOptions[behavior] = true;
	
	router.navigate(e.currentTarget.getAttribute('href'), navigationOptions)
}

function interceptLinks(router) {
	var boundNavigate = navigate.bind(undefined, router);
	jquery(document).on('click', 'a:not([href^=http]), a:not([data-router="ignore"])', boundNavigate);
}

var backboneServer = {

	setPort: function () {

	},

	setLayoutsDirectory: function (layoutsDir) {
		layoutsDirectory = layoutsDir;
	},

	setDefaultLayoutFile: function (layoutFile) {
		defaultLayoutFileName = layoutFile;
	},

	setServerRoot: function (directory) {
		
	},

	setRoutes: function (routesData) {
		routes = routesData;
	},


	__loadLayout: function (layoutPath) {
		var defer = Q.defer();
		var promise = defer.promise;

		if (previousLayout !== layoutPath) {
			promise = pigeon.get(layoutPath);
		} else {
			defer.resolve();
		}

		previousLayout = layoutPath;

		return promise;
	},


	__loadTemplate: function (templatePath) {

		var defer = Q.defer();
		var promise = defer.promise;

		if (previousTemplate !== templatePath) {
			promise = pigeon.get(templatePath);
		} else {
			defer.resolve();
		}

		previousTemplate = templatePath;

		return promise;
	},

	activate: function () {
		var router = new Backbone.Router();
		var server = this;

		routes.reverse().forEach(function (routeData) {

			router.route(routeData.path.replace('/', ''), '', function () {

				routeData.action().then(function (actionData) {


					var layoutPath = layoutsDirectory + '/' + defaultLayoutFileName;
					
					server.__loadLayout(layoutPath)
						.then(function (layoutString) {
							return server.__loadTemplate(actionData.template);
						})

						.then(function (templateString) {
							if (templateString) {
								console.log('ok')
								window.document.querySelector('.contents').innerHTML = templateString;
							}


							serverRenderer.render(window.document, actionData);
							
						});

				});

			});

		});

		interceptLinks(router);
		Backbone.history.start({
			pushState:true
		});

	}

}

module.exports = backboneServer;