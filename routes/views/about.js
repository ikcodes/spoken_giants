var async = require('async');
var keystone = require('keystone');
const { isDark } = require('../launch-logic');

// CHANGE HOMEPAGE FILTER TO THE NEWS SLUG
//========================================
const hardcodeFilter = 'your-rights-updates';

exports = module.exports = function (req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	if(isDark()){ view.render('landing'); return; }
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'about'
	locals.title = 'Spoken Giants | Home'
	locals.filters = {
		category: hardcodeFilter,
	};
	locals.data = {
		team: [],
		posts: [],
		categories: [],
	}
	
	// Get page and content
	view.on('init', function(next){
		var q = keystone.list('Page').model.find({slug: 'home-page'});
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
	
	// Get our Team Members in here
	view.on('init', function(next){
		keystone.list('TeamMember').model.find().sort('sortOrder').exec(function (err, results) {
			if (err || !results.length) {
				return next(err);
			}
			locals.data.team = results;
			next();
		});
	});
	// Load all categories
	view.on('init', function (next) {
		keystone.list('PostCategory').model.find().sort('name').exec(function (err, results) {
			
			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function (category, next) {

				keystone.list('Post').model.count().where('categories').in([category.id]).exec(function (err, count) {
					category.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current category filter
	view.on('init', function (next) {
		keystone.list('PostCategory').model.findOne({ key: hardcodeFilter }).exec(function (err, result) {
			locals.data.category = result;
			next(err);
		});
});

	// Load the posts
	view.on('init', function (next) {

		var q = keystone.list('Post').paginate({
			page: 1,
			perPage: 3,
			maxPages: 1,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author categories');

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.posts = results;
			locals.data.totalPosts = results.length
			next(err);
		});
	});
	
	// Render the view
	view.render('about');
};
