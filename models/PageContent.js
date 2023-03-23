var keystone = require("keystone");
var Types = keystone.Field.Types;

/**==========
 * PageContent Model
 * https://v4.keystonejs.com/api/list/options/
 * ==========
 */

var PageContent = new keystone.List("PageContent", {
	autokey: { path: "slug", from: "title", unique: true },
	map: { name: "title" },
	nocreate: process.env.NODE_ENV == "production" ? true : false,
	nodelete: process.env.NODE_ENV == "production" ? true : false,
	singular: "Page Content",
	plural: "Page Content",
	defaultSort: "sortOrder",
});

PageContent.add({
	title: { type: String, required: true },
	content: { type: Types.Html, wysiwyg: true, height: 400 },
	parent: { type: Types.Relationship, ref: "Page", index: true },
	sortOrder: { type: Number },
});

PageContent.defaultColumns = "title|35%, content, parent|10%";
PageContent.register();
