require("dotenv").config();
var keystone = require("keystone");

// http://keystonejs.com/guide/config for available options
keystone.init({
	name: "Spoken Giants",
	brand: "Spoken Giants",
	sass: "public",
	static: "public",
	favicon: "public/favicon.ico",
	views: "templates/views",
	"view engine": "pug",
	"auto update": true,
	session: true,
	auth: true,
	"user model": "User",
	mongo: "mongodb://localhost/spoken-giants",
});

// Load your project's Models
keystone.import("models");

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set("locals", {
	_: require("lodash"),
	env: keystone.get("env"),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set("routes", require("./routes"));

// Configure the navigation bar in Keystone's Admin UI
keystone.set("nav", {
	content: ["pages", "page-contents", "faqs", "licensing-steps"],
	news: ["posts", "post-categories"],
	teamMembers: "team-members",
	contactForm: "enquiries",
	// applications: 'applications',
	users: "users",
});

// CUSTOM SETTINGS
keystone.set({
	port: process.env.PORT,
	environment: process.env.NODE_ENV,
	documentHash: process.env.TEMPLATE_HASH,
});

// SEND IT
keystone.start();
