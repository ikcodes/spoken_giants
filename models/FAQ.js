var keystone = require("keystone");
var Types = keystone.Field.Types;

/**
 * FAQ Model
 * OPTIONS: https://v4.keystonejs.com/api/list/
 * ==================
 */

var FAQ = new keystone.List("FAQ", {
	map: { name: "question" },
	sortable: true,
});

FAQ.add({
	question: { type: String, required: true },
	answer: { type: Types.Html, wysiwyg: true, height: 400 },
});

// These percentages set the column width in CMS
FAQ.defaultColumns = "question|50%, answer";
FAQ.register();
