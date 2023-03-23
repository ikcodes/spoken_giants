//==============================
// ENDPOINT FOR SIGNUP PROCESS!
//=============================
var fs = require("fs");
var moment = require("moment");
var keystone = require("keystone");
var nodemailer = require("nodemailer");
var Application = keystone.list("Application");
const { Client, Field, Signer, Template, Recipient } = require("eversign");

//======================{ EVERSIGN }========================
// DOCS:
// https://www.npmjs.com/package/eversign?activeTab=readme
// https://github.com/eversign/eversign-node-sdk#README
// https://eversign.com/api/documentation/methods#get-document-template

// ENV CONFIG:
const SANDBOX = process.env.TEST_SIGNUP == "true" ? true : false;
const EVERSIGN_EMAIL = SANDBOX
	? "ian.kendall@800poundgorillarecords.com"
	: "membership@spokengiants.com";

// UNCHANGING CONFIG
const BIZ_ID = "148839";
const API_KEY = process.env.EVERSIGN_API_KEY;
const client = new Client(API_KEY, BIZ_ID);
const TEMPLATE_HASH = process.env.TEMPLATE_HASH;

// SET CCs HERE
// Add as many as 4. Template has 'CC 1', 'CC 2', etc. Add more to Eversign BEFORE adding them here.
let ccs = [];
if (SANDBOX) {
	ccs = [
		{
			name: "First Ian Kendall",
			email: "iankendalldev@gmail.com",
		},
		{
			name: "Second Ian Kendall",
			email: "iankgtr@gmail.com",
		},
	];
} else {
	ccs = [
		{
			name: "Jim King",
			email: "jking@spokengiants.com",
			// name: "Ian Testname",
			// email: 'iankendalldev@gmail.com'	// Keep for testing
		},
		{
			name: "Mike Bannon",
			email: "mbannon@spokengiants.com",
			// name: "Ian Testname",
			// email: 'iankgtr@gmail.com'	// Keep for testing
		},
		{
			name: "Jordan King",
			email: "jordan@spokengiants.com",
			// name: "Ian Testname",
			// email: 'iankendall17@gmail.com'	// Keep for testing
		},
	];
}

/* FROM EVERSIGN SUPPORT:

	For the documents to be returned to yourself for signature, 
you need to add yourself as the second signer and not as a recipient 
(this is technically just a CC). 

	You need to make sure that the “roles” of the signers you add 
match the roles you created in the template.

	The Account's email address is above ^ and must match whatever
email address you log in with.

	Also, ensure the account's main email address is encapsulated
in the EVERSIGN_EMAIL variable. 

*/
//==========================================================
exports = module.exports = function (req, res) {
	const appId = req.body.app_id || null;
	const action = req.body.action || null;

	if (appId === null && action == null) {
		res.json({
			success: 0,
			message: "You did not provide an app ID",
		});
	}

	if (action == "send_email") {
		if (req.body.email && req.body.name) {
			const name = req.body.name;
			const email = req.body.email;
			sendMail(name, email);
			res.json({
				success: 1,
				message: "sending email to these two:",
				name: name,
				email: email,
			});
		} else {
			res.send("INSUFFICIENT EMAIL STATUS MET!");
		}
	}

	if (action === "load_app") {
		var q = Application.model.findOne({
			_id: appId,
		});
		q.exec(function (err, appData) {
			if (err) {
				res.json({ success: 0, error: err });
			} else {
				res.json({
					success: 1,
					app: appData,
					app_id: appId,
				});
			}
		});
	}

	if (action === "update_app") {
		var q = Application.model.findOne({
			_id: appId,
		});
		q.exec(function (err, appData) {
			if (err) {
				res.json({ success: 0, error: err });
			} else {
				// OK. We have the app. Time to update.	https://v4.keystonejs.com/api/list/update-item/

				let newData = req.body.app;
				if (newData.step == 2) {
					// Load document for signing

					var TURN_OFF_EVERSIGN = false;
					if (TURN_OFF_EVERSIGN === true) {
						res.json({
							success: 1,
							app: newData,
							app_id: newData._id,
							message: "You turned off Eversign! Hooray!!!!!!! :D",
						});
					}

					var documentTemplate = new Template();
					documentTemplate.setSandbox(SANDBOX);
					documentTemplate.setTemplateId(TEMPLATE_HASH);
					documentTemplate.setEmbeddedSigningEnabled(true);
					documentTemplate.setExpires(32503680000); // Set to expire in year 3000

					// CUSTOM FIELDS
					//=======================
					// Name
					var name_field1 = new Field();
					name_field1.setIdentifier("affiliateName1");
					name_field1.setValue(appData.name);
					documentTemplate.appendField(name_field1);

					var name_field2 = new Field();
					name_field2.setIdentifier("affiliateName2");
					name_field2.setValue(appData.name);
					documentTemplate.appendField(name_field2);

					var name_field3 = new Field();
					name_field3.setIdentifier("affiliateName3");
					name_field3.setValue(appData.name);
					documentTemplate.appendField(name_field3);

					// EIN / SSN
					// var ssn_field = new Field();
					// ssn_field.setIdentifier('einSSN');
					// ssn_field.setValue(newData.number);
					// documentTemplate.appendField(ssn_field);

					// Contract expiration date => now TWO years (was 3 until 01.2021)
					var expDate = moment().add(2, "years").format("MMM DD YYYY");
					var exp_date_field = new Field();
					exp_date_field.setIdentifier("endDate");
					exp_date_field.setValue(expDate);
					documentTemplate.appendField(exp_date_field);

					// APPEND RECIPIENCES (CCs)
					//==========================
					var i = 1;
					ccs.forEach((cc) => {
						if (cc["name"] && cc["email"]) {
							var new_cc = new Recipient();
							new_cc.setRole("CC " + i);
							new_cc.setName(cc["name"]);
							new_cc.setEmail(cc["email"]);
							documentTemplate.appendRecipient(new_cc);
							i++;
						} else {
							console.log("Insufficient information to add CC");
						}
					});

					// SIGNATURES
					//=======================
					// Affiliate signs
					var affiliate = new Signer();
					affiliate.setRole("Affiliate");
					affiliate.setName(appData.name); // Careful! Name is not passed in $_POST, have to get it from db pull
					affiliate.setEmail(newData.email);
					documentTemplate.appendSigner(affiliate);

					// Create and append the company as a signer (technically just a CC)
					var company = new Signer();
					company.setRole("Company");
					company.setName("Jim King");
					company.setEmail(EVERSIGN_EMAIL);
					documentTemplate.appendSigner(company);

					// Create document, add it to the object, save that, then keep going.
					client
						.createDocumentFromTemplate(documentTemplate)
						.then(function (createdDocument) {
							embeddedSigningURL = createdDocument
								.getSigners()[0]
								.getEmbeddedSigningUrl(); // https://github.com/eversign/eversign-node-sdk/blob/HEAD/examples/iframe_template.js
							documentHash = createdDocument.getDocumentHash(); // Keep in case we need later.
							if (embeddedSigningURL) {
								// Complete internal app
								newData["documentLink"] = embeddedSigningURL;
								newData["documentHash"] = documentHash;
								newData["step"] = 3;
								newData["complete"] = true;

								// SEND POST THAT EVERSIGN HAS LOADED
								Application.updateItem(appData, newData, function () {
									res.json({
										success: 1,
										app: newData,
										app_id: newData._id,
										iframe_url: embeddedSigningURL,
										document_hash: documentHash,
									});
								});
							} else {
								// This never seems to get hit.
								res.json({
									success: 0,
									app: newData,
									message:
										"Could NOT get the signing URL process to jigify itself!",
								});
							}
						})
						.catch(function (err) {
							Application.model.deleteOne(
								{ _id: appData._id },
								function (mongo_err) {
									res.json({
										docusignFailed: true,
										success: 0,
										error: err,
										mongo_err: mongo_err,
										app: newData,
										message:
											"There a problem with Eversign. Please refresh the page and try again.",
									});
								}
							);
						});
				} else if (newData.step === 3) {
					// NOT YET COMPLETE. NO HANDSHAKE W/ EVERSIGN.
					Application.updateItem(appData, newData, function () {
						res.json({
							success: 1,
							app: newData,
							app_id: newData._id,
						});
					});
				} else {
					console.log("DID NOT INTERACT WITH DOCUSIGN.");
					Application.updateItem(appData, newData, function () {
						res.json({
							success: 1,
							app: newData,
							app_id: newData._id,
						});
					});
				}
			}
		});
	}

	if (action === "create_app") {
		var newApp = new Application.model();
		var updateHandler = newApp.getUpdateHandler(req);
		updateHandler.process(
			req.body.app,
			{
				logErrors: true,
				flashErrors: false,
				fields: "name, step",
			},
			function (err) {
				if (err) {
					res.json({
						success: 0,
						error: err,
					});
				} else {
					const appData = updateHandler.item; // This represents the db item
					res.json({
						success: 1,
						app: appData,
						app_id: newApp._id,
					});
				}
			}
		);
	}
}; // End exports

function sendMail(name, email) {
	// Load template & customize for send. Template comes in as a buffer

	const subject = "Your Spoken Giants Application";
	let template_html = fs.readFileSync("email/verification-email-template.html");
	const html = template_html.toString().replace("__NAME__", name);

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: { user: "membership@spokengiants.com", pass: "spokenrules" },
	});

	// from params
	const mailOptions = { to: email, subject: subject, html: html };
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			res.json(error);
		} else {
			res.send("Email sent: " + info.response);
		}
	});
}
