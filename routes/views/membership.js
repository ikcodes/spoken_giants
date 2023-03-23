var keystone = require("keystone");
const { isDark } = require("../launch-logic");

exports = module.exports = function (req, res) {
	if (isDark()) {
		res.redirect("/");
	}

	// Init locals
	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.section = "membership";
	locals.title = "Spoken Giants | Membership";
	locals.faqs = [];

	// Get page and content
	view.on("init", function (next) {
		var q = keystone.list("Page").model.find({ slug: "membership" });
		q.exec(function (err, res) {
			locals.page = res[0];
			const parentId = res[0]["_id"];
			var c = keystone
				.list("PageContent")
				.model.find({ parent: parentId })
				.sort("sortOrder");
			c.exec(function (err, res) {
				locals.content = res;
				next(err);
			});
		});
	});

	// Get FAQs
	view.on("init", function (next) {
		var q = keystone.list("FAQ").model.find().sort("sortOrder");
		q.exec(function (err, results) {
			locals.faqs = results;
			next(err);
		});
	});

	// Get licensing steps
	view.on("init", function (next) {
		var q = keystone.list("LicensingStep").model.find().sort("sortOrder");
		q.exec(function (err, results) {
			locals.lsteps = results;
			next(err);
		});
	});

	// Render the view
	view.render("membership", {
		api_key: process.env.MEMBERSHIP_API_KEY,
		// test: 'success',
	});
};
