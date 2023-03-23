var keystone = require("keystone");
var Types = keystone.Field.Types;

/**
 * Page Model
 * ==================
 */

var Page = new keystone.List("Page", {
	autokey: { path: "slug", from: "title", unique: true },
	map: { name: "title" },
	nocreate: process.env.NODE_ENV == "production" ? true : false,
	nodelete: process.env.NODE_ENV == "production" ? true : false,
});

Page.add({
	title: { type: String, required: true },
	image: { type: Types.CloudinaryImage },
});

Page.schema.virtual("link").get(function () {
	const baseUrl =
		process.env.NODE_ENV == "production"
			? "https://spokengiants.com/"
			: "http://localhost:3000/";
	console.log("SOMETHINGS HAPPENING: " + baseUrl);
	return baseUrl + this.slug;
});

Page.relationship({ ref: "PageContent", path: "pages", refPath: "parent" });
Page.defaultColumns = "title, link";
Page.register();
