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
		
		action:function () {
			var defer = Q.defer();

			defer.resolve({
				template:staticDir + '/views/home/index.html',
				pageTitle:'pagetitle2',
				ogTitle:'foo'
			})

			return defer.promise;
		}

	}, {

		path:"/foo",
		
		action:function () {
			var defer = Q.defer();

			defer.resolve({
				template:staticDir + '/views/foo/index.html',
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

		path:"/post",
		
		action:function () {
			var defer = Q.defer();

			defer.resolve({
				template:staticDir + '/views/foo/index.html',
				pageTitle:'pagetitlefoo',
				ogTitle:'fooasd',
				contents:{
					post: {
						title:'post',
						body:'<a href="/foo">foo</a>'
					}
				}
			})

			return defer.promise;

			
		}

	}])

	.activate();