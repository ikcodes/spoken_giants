var keystone = require("keystone");
var Types = keystone.Field.Types;

/**
 * TEAM MEMBER Model
 * OPTIONS: https://v4.keystonejs.com/api/list/
 * ==================
 */

var TeamMember = new keystone.List("TeamMember", {
	map: { name: "name" },
	autokey: {
		path: "slug",
		from: "name",
		unique: true,
		dependsOn: { category: "member" },
	},
	sortable: true,
	initial: true,
});

TeamMember.add({
	name: { type: String, required: true, intial: true },
	category: {
		type: Types.Select,
		options: "employee, member",
		default: "employee",
		index: true,
		initial: true,
	},
	email: { type: Types.Email },
	joinDate: {
		type: Types.Date,
		index: true,
		dependsOn: { category: "member" },
	},
	position: {
		type: String,
		required: true,
		dependsOn: { category: "employee" },
		initial: true,
	},
	phone: { type: String, dependsOn: { category: "employee" } },
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: {
			type: Types.Html,
			wysiwyg: true,
			height: 400,
			dependsOn: { category: "member" },
		},
	},
});

TeamMember.defaultColumns = "name|25%, category|25%, content.brief|50%";
TeamMember.register();
