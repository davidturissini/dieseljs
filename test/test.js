var stateless = require('./../src/stateless');
var staticDir = process.browser ? '' : __dirname;
var Q = require('q');
var pigeon = require('pigeon');

stateless
	
	.setPort(process.env.PORT || 8888)
	.setServerRoot(staticDir)
	.setLayoutsDirectory('/layouts')
	.setDefaultLayoutFile('main.html')

	.setRoutes([{

		path:"/",

		template:staticDir + '/views/home/index.html',
		
		action:function () {
			var defer = Q.defer();

			defer.resolve({
				pageTitle:'pagetitle2',
				ogTitle:'foo'
			})

			return defer.promise;
		}

	}, {

		path:"/foo",

		template:staticDir + '/views/foo/index.html',
		
		action:function () {
			var defer = Q.defer();

			defer.resolve({
				pageTitle:'pagetitlefoo',
				ogTitle:'fooa',
				contents:{
					post: {
						title:'foo',
						body:'<a href="/post">post</a>'
					}
				}
			})

			return defer.promise;
			
		}

	},{

		path:"/post/:post_id",

		template:staticDir + '/views/foo/index.html',
		
		action:function (params) {
			console.log(params);
			var defer = Q.defer();

			defer.resolve({
				
				pageTitle:'pagetitlefoo',
				ogTitle:'fooasd',
				contents:{
					post: {
						title:'post'
					}
				}
			})

			return defer.promise;

			
		}

	}])

	.activate();