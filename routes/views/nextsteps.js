var keystone = require('keystone');
const { isDark } = require('../launch-logic');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'next-steps';
	locals.title = 'Spoken Giants | Next Steps'
	
	// Get page and content
	view.on('init', function(next){
		var q = keystone.list('Page').model.find({slug: 'next-steps'});
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
	if(isDark()){
		view.render('landing-next-steps');
	}else{
		view.render('next-steps')
	}
};
