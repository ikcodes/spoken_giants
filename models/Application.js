var keystone = require("keystone");
var Types = keystone.Field.Types;

/**=============================================
	 APPLICATION Model
 * OPTIONS: https://v4.keystonejs.com/api/list/
 * =============================================
 */

var Application = new keystone.List("Application");

Application.add({
	step: { type: Number },
	name: { type: String },
	email: { type: Types.Email },
	phone: { type: String },
	number: { type: String }, // EIN or SSN, whichever is specified in the agreement
	documentLink: { type: String },
	documentHash: { type: String },
	complete: { type: Boolean },
});

Application.defaultColumns = "name, step, complete";
Application.register();
