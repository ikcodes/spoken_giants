// For Application handling, see signup_ajax. This generic file just puts the template on the page. 
var keystone = require('keystone');
var { isDark } = require('../launch-logic');

exports = module.exports = function (req, res) {
	
	var locals = res.locals;
	locals.section = 'sign-up';
	locals.title = 'Spoken Giants | Sign Up'
	
	// Print an on-page warning for test signups.
	locals.testing_signup = process.env.TEST_SIGNUP == 'true' ? true : false;
	
	var view = new keystone.View(req, res);
	
	if(isDark()){
		view.render('landing-sign-up');
	}else{
		view.render('sign-up');
	}
};
