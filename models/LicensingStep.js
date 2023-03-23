var keystone = require("keystone");
var Types = keystone.Field.Types;

/**==========
 * LicensingStep Model
 * https://v4.keystonejs.com/api/list/options/
 * ==========
 */

var LicensingStep = new keystone.List("LicensingStep", {
	autokey: { path: "slug", from: "title", unique: true },
	map: { name: "title" },
	nocreate: process.env.NODE_ENV == "production" ? true : false,
	nodelete: process.env.NODE_ENV == "production" ? true : false,
	sortable: true,
});

LicensingStep.add({
	title: { type: String, required: true },
	content: { type: Types.Html, wysiwyg: true, height: 400 },
});

LicensingStep.defaultColumns = "title|30%, content";
LicensingStep.register();
