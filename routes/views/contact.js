var keystone = require("keystone");
var nodemailer = require("nodemailer");
var Enquiry = keystone.list("Enquiry");
var request = require("request");
const { isDark } = require("../launch-logic");

exports = module.exports = function (req, res) {
	// Set locals
	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.section = "contact";
	locals.title = "Spoken Giants | Contact";
	locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;

	// On POST requests, add the Enquiry item to the database
	view.on("post", { action: "contact" }, function (next) {
		if (
			req.body["g-recaptcha-response"] === undefined ||
			req.body["g-recaptcha-response"] === "" ||
			req.body["g-recaptcha-response"] === null
		) {
			return res.json({ responseError: "Invalid captcha." });
		}

		const secretKey = process.env.CAPTCHA_SECRET_KEY;
		const verificationURL =
			"https://www.google.com/recaptcha/api/siteverify?secret=" +
			secretKey +
			"&response=" +
			req.body["g-recaptcha-response"] +
			"&remoteip=" +
			req.connection.remoteAddress;

		request(verificationURL, function (error, response, body) {
			console.log("REQUEST CAME BACK!!!");
			body = JSON.parse(body);
			if (body.success !== undefined && !body.success) {
				return res.json({ responseError: "Failed captcha verification!!!" });
			}

			// SUCCESS! Repeat standard behavior.
			//====================================
			var newEnquiry = new Enquiry.model();
			var updater = newEnquiry.getUpdateHandler(req);
			updater.process(
				req.body,
				{
					flashErrors: true,
					fields: "name, email, phone, message",
					errorMessage: "There was a problem submitting your enquiry:",
				},
				function (err) {
					if (err) {
						locals.validationErrors = err.errors;
					} else {
						locals.enquirySubmitted = true;
					}
					sendContactMail(); // Trigger email to Jordan
					next();
				}
			);
		});
	});
	if (isDark()) {
		view.render("landing-contact");
	} else {
		view.render("contact");
	}
};

function sendContactMail() {
	// Another version of this function uses a template. No need here.
	// const email = process.env.NODE_ENV == 'production' ? 'jordan@spokengiants.com' : 'ian.kendall@800poundgorillarecords.com'
	const email = "jordan@spokengiants.com";
	const subject = "New Spoken Giants contact form submission";
	const html =
		"<h3>New Message!</h3><p>We have received a message from the Contact form on the Spoken Giants website.</p><p>To view this message in the CMS, please <a href='https://spokengiants.com/keystone/enquiries'>Click Here</a>.</p>";

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: { user: "membership@spokengiants.com", pass: "spokenrules" },
	});

	// from params
	const mailOptions = { to: email, subject: subject, html: html };
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			return error;
		} else {
			return;
		}
	});
}
