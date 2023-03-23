var keystone = require('keystone');

// JUST RENDER THE PRESS RELEASE

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	view.render('press-release');
}

