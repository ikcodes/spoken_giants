var keystone = require('keystone');
const { isDark } = require('../launch-logic');

exports = module.exports = function (req, res) {
	
	if(isDark()){ res.redirect("/") }

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'licensing';
	locals.title = 'Spoken Giants | Licensing'
	
	// Get page and content
	view.on('init', function(next){
		var q = keystone.list('Page').model.find({slug: 'licensing'});
		q.exec(function(err, res){
			locals.page = res[0];
			const parentId = res[0]['_id'];
			var c = keystone.list('PageContent').model.find({parent: parentId}).sort('sortOrder')
			c.exec(function(err, res){
				locals.content = res;
				next(err);
			})
		})
	})
	

	// Render the view
	view.render('licensing');
};
