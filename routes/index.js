var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	
	// LANDING PAGE ROUTES (FUNCTION NORMAL-ISH)
	app.get('/', routes.views.about);
	app.get('/about', routes.views.about);
	app.get('/next-steps', routes.views.nextsteps);
	app.get('/press-release', routes.views.press_release);
	app.all('/sign-up', routes.views.signup);
	app.all('/signup-ajax', routes.views.signup_ajax);
	
	// NON-LANDING PAGE ROUTES (IF DARK, 301 REDIRECT TO HOME)
	app.get('/membership', routes.views.membership);
	app.get('/licensing', routes.views.licensing);
	
	// app.get('/news', function(req, res){
	//   res.redirect('/news/new-member-announcements');
	// })
	
	app.get('/news/:category?', routes.views.news);
	app.get('/news/post/:post', routes.views.post);
	app.all('/get-in-touch', routes.views.contact);
	app.get('/contact', function(req, res){
		res.redirect('/get-in-touch');
	})
	
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
};
