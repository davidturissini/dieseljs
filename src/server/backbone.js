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
var previousLayout = '';
var previousData = {};
var currentRoute;
var bodyEl;
var contentEl;
var analytics;
var templateCache = {};

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


function parseRouteArguments (path, routeArgs) {
	var params = {};
	var routeArgProps = path.match(/:[a-zA-Z_]+/g);

	if (routeArgProps) {
		routeArgProps.forEach(function (prop, index) {
			params[prop.replace(':', '')] = routeArgs[index]; 
		});
	}

	return params;
}


function renderHTML (params, documentFragment) {
	contentEl.innerHTML = '';
	contentEl.appendChild(documentFragment);


	this.action(window.document, params)
		.then(function (data) {
			
			if (currentRoute && typeof currentRoute.onUnload === 'function') {
				currentRoute.onUnload();
			}

			if (typeof this.onLoad === 'function') {
				return this.onLoad(data);
			}
			
		}.bind(this))

		.then(function () {
			if (bodyEl.hasClass('loading') === true) {
				bodyEl.removeClass('loading');
			}
			
			if (analytics && analytics.track && typeof analytics.track === 'function') {
				analytics.track(window.location.pathname);
			}

			currentRoute = routeData;

		}.bind(this))
}


function onRouteChange () {

	if (bodyEl.hasClass('loading') === false) {
		bodyEl.addClass('loading');
	}
	window.scrollTo(0, 0);
	
	var params = parseRouteArguments(this.path, Array.prototype.slice.call(arguments));

	var layoutPath = layoutsDirectory + '/' + defaultLayoutFileName;
	
	backboneServer.__loadLayout(layoutPath)
		.then(backboneServer.__loadTemplate.bind(backboneServer, this.template))
		.then(renderHTML.bind(this, params));

};


var backboneServer = {

	setAnalytics: function (analyticsDelegate) {
		analytics = analyticsDelegate;
	},

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

		if (templateCache[templatePath] === undefined) {
			promise = pigeon.get(templatePath)
				.then(function (responseHTML) {
					var parser = new DOMParser();
					var parsedContents = parser.parseFromString(responseHTML, 'text/html');
					var fragment = document.createDocumentFragment();
					var children = Array.prototype.slice.call(parsedContents.body.children);

					for(var i = 0; i < children.length; i += 1) {
						fragment.appendChild(children[i]);
					}

					templateCache[templatePath] = fragment.cloneNode(true);

					return fragment;

				});

		} else {

			defer.resolve(templateCache[templatePath].cloneNode(true));

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

		bodyEl = jquery('body');
		contentEl = document.querySelector('.content');
		
		
		routes.reverse().forEach(function (routeData) {
			router.route(routeData.path.replace('/', ''), '', onRouteChange.bind(routeData));
		});

		interceptLinks(router);
		Backbone.history.start({
			pushState:true
		});

	}

}

module.exports = backboneServer;