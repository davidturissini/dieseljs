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
var previousTemplate = '';
var previousLayout = '';
var previousData = {};
var currentRoute;

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
	jquery(document).on('click', 'a:not([href^=http]):not([data-router="ignore"])', boundNavigate);
}

var backboneServer = {

	setRenderer: function (renderer) {
		serverRenderer = renderer;
	},

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


	__fillRecursive: function (incoming, outgoing) {
		for(var x in outgoing) {
			if (outgoing.hasOwnProperty(x)) {

				if (typeof outgoing[x] === 'object') {

					if (incoming[x] === undefined) {
						incoming[x] = {};
					}

					incoming[x] = this.__fillRecursive(incoming[x], outgoing[x]);

				} else if (incoming[x] === undefined) {
					incoming[x] = '';
				}

			}
		}

		return incoming;

	},


	activate: function () {
		var router = new Backbone.Router();
		var server = this;
		var bodyEl = jquery('body');
		var contentEl = jquery('.content');
		
		routes.reverse().forEach(function (routeData) {

			router.route(routeData.path.replace('/', ''), '', function () {
				if (bodyEl.hasClass('loading') === false) {
					bodyEl.addClass('loading');
				}

				var params = {};
				routeArgValues = Array.prototype.slice.call(arguments);
				routeArgProps = routeData.path.match(/:[a-zA-Z_]+/g);

				if (routeArgProps) {
					routeArgProps.forEach(function (prop, index) {
						params[prop.replace(':', '')] = routeArgValues[index]; 
					});
				}


				var layoutPath = layoutsDirectory + '/' + defaultLayoutFileName;
				
				server.__loadLayout(layoutPath)
					.then(server.__loadTemplate.bind(server, routeData.template))

					.then(function (templateString) {
						if (templateString) {
							contentEl.html(templateString);
						}


						routeData.action(window.document, params)
							.then(function (data) {
								if (currentRoute && typeof currentRoute.onUnload === 'function') {
									currentRoute.onUnload();
								}

								if (typeof routeData.onLoad === 'function') {
									return routeData.onLoad(data);
								}
								
							})

							.then(function () {
								if (bodyEl.hasClass('loading') === true) {
									bodyEl.removeClass('loading');
								}
								currentRoute = routeData;
							})
						
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