// GLOBAL STEP HANDLER
//=====================
var currentStep = 1;

//======================================
// DEFINE HELPERS
// SUBMIT / CLICK HANDLERS BELOW
//======================================
function changeStep(nextStep){
	
	var advancing = false;
	if(currentStep < nextStep){
		currentStep  = nextStep;
		advancing = true;
	}
	
	if(advancing && currentStep == 4){
		console.log('COMPLETING APPLICATION:');
		completeApp();
	}
	else{
		$('#step' + nextStep).slideDown(function(){
			$('.raised-section').not('#step' + nextStep).slideUp()	// yep, all of 'em
			if(nextStep === 1){ gotoStep1(advancing) }
			else if(nextStep === 2){ gotoStep2(advancing) }
			else if(nextStep === 3){ gotoStep3(advancing) }
			else{ 
				alert("There was a problem with your application. Please refresh the page and try again.")
			}
		})
	}
}

// MANAGE SWITCHING STEPS
function gotoStep1(advancing = false){
	$("#step1url").removeClass('disabled').addClass('active');
	$('#step2url, #step3url, #step4url').removeClass('active');
	if(advancing){
		$('#step2url, #step3url, #step4url').removeClass('active complete').addClass('disabled')
	}
	$("#name").focus()
}
function gotoStep2(advancing = false){
	$("#step2url").removeClass('disabled').addClass('active');
	$('#step1url, #step3url, #step4url').removeClass('active');
	if(advancing){
		$('#step1url').addClass('complete');
		$('#step3url, #step4url').removeClass('active complete').addClass('disabled');
	}
	$("#email").focus();
}
function gotoStep3(advancing = false){
	$("#step3url").removeClass('disabled').addClass('active');
	$('#step1url, #step2url, #step4url').removeClass('active');
	if(advancing){
		$('#step1url, #step2url').addClass('complete');
		$('#step4url').removeClass('active complete').addClass('disabled');
	}
}
function completeApp(){
	$("#step4").addClass('b-marg-45').slideDown();
	$("#eversignContainer").slideUp();
	$("#step4url").removeClass('disabled').addClass('complete');
	$('#step1url, #step2url, #step3url').removeClass('active complete').addClass('disabled');	// No going back.
}


//====================================================================
//==================={ API / POSTING FUNCTIONS }======================
//====================================================================
var appData = {}	// PUT BEFORE	FUNCTIONS THAT USE IT  |
//=====================================================|

function postForEmail(name, email){
	var postData = {
		action: 'send_email',
		appId: 12345,	// Avoid server catch
		name: name,
		email: email,
	}
	$.post('/signup-ajax', postData, function(res){
		if(res){
			console.log(res);
		}else{
			console.log('NO RES.');
		}
	});
}

function renderIframe(embeddedSigningURL){
	console.log("Rendering iframe for document: " + embeddedSigningURL);
	eversign.open({
		url: embeddedSigningURL,
		containerID: "eversignContainer",
		width: 802,
		height: 802,
		events: {
			loaded: function () {
				$('body').addClass('signing');
				$("#eversignPopup").addClass('active');
				$("#eversignLoading").slideUp()
			},
			signed: function () {
				$('body').removeClass('signing');
				$("#eversignPopup").remove();
				postForEmail(appData['name'], appData['email']);
				changeStep(4);
			},
			declined: function () {
				alert("You have declined to sign the document. That's OK. You can always start a new application again.")
				changeStep(1)
			},
			error: function () {
				alert("We're sorry, but the site has experienced an error. Please refresh the page and restart your application.")
				changeStep(1)
			}
		}
	});
}

//===========================================================================================================

$(function(){

	//=======================================
	//	BROWSER => LOCAL API
	//=======================================
	
	
	// VALIDATION & SUBIT HANDLERS
	//-----------------------------
	$("#step1form").validate({
		rules: {
			name: 'required'
		},
		submitHandler: function(){
			var name = $("#name").val()
			if(!name.length){
				alert("Please provide a valid name.")
				return
			}
			var postData = {
				action: 'create_app',
				app: {
					name: name,
					step: currentStep,
				}
			}
			$.post('/signup-ajax', postData, function(res){
				$("#submitstep1").prop('disabled', true)
				if(res.success && res.app_id){
					appId = res.app_id;
					appData = res.app;
					changeStep(2);
				}else{
					alert('There was an error. Please refresh the page and try again.')
				}
			})
		}
	})
	
	
	$("#step2form").validate({
		rules: {
			phone: 'required',
			// number: 'required',	// REMOVED 01.28.2021
			email: {
				required: true,
				email: true
			}
		},
		submitHandler: function(){
			$("#submitstep2").prop('disabled', true)
			if(!appId){
				alert("No existing app ID! Bailing out.")
			}
			var email = $('#email').val()
			var phone = $('#phone').val()
			// var number = $('#number').val()	// REMOVED 01.28.2021
			if(!email.length || !phone.length){	// UPDATED
				alert('You have not correctly filled out the fields.')
				return;
			}
			appData['email'] = email;	// IMPORTANT! This is used to email the client.
			var postData = {
				action: 'update_app',
				app_id: appId,
				app: {
					_id: appId,
					step: 2,
					email: email,
					phone: phone,
					// number: number, // REMOVED 01.28.2021
					// name: appData['name'],
				},
			}
			$("#submitstep2").prop('disabled', true);
			$("#areYouReady").slideDown();
			$("html, body").animate({ scrollTop: 0 }, "slow");
			
			// FINAL "I'M READY" CLICK
			$("#imReady").click(function(e){
				$("#step2").slideUp();
				$("#eversignLoading").slideDown();
				e.preventDefault()
				
				// FIRES THE POST THAT LOADS EVERSIGN
				// ==================================
				$.post('/signup-ajax', postData, function(res){	// EVERSIGN CALLBACK
					
					if(res.docusignFailed){
						alert('We were not able to proces your registration at this time. Please refresh the page to try again.');
						console.log(res.error);
						console.log("RES ERROR ^ RAW RES v");
						console.log(res);
						// location.reload();
					}
					else if(res.success && res.app_id){
						changeStep(3)
						appId = res.app_id
						// appData = res.app	// ALREADY WORKS BY THIS POINT. DO NOT OVERWRITE APPDATA
						renderIframe(res.app.documentLink)
					}else{
						alert('There was an error loading your Membership Agreement. Please refresh the page and try again.')
					}
				})
			})
		}
	})	// End validate!

	
	// Bail!
	$("#notReady").click(function(e){
		e.preventDefault();
		$("#iAmNotReady").slideDown();
		$("#areYouReady").slideUp();
		$("#step2").slideUp();
		$("html, body").animate({ scrollTop: 0 }, "slow");
	});
	
	//======================================
	// IN-BROWSER FUNCTIONALITY
	//======================================
	
	gotoStep1();
	
	$("#navUl li a").click(function(){
		var nextStep = $(this).data('step-goto')
		if(!$(this).hasClass('disabled')){
			changeStep(nextStep);
		}
	})
	
	var phoneMask = new Cleave('#phone', {
		blocks: [0, 3, 0, 3, 4],
		delimiters: ["(", ")", " ", "-"],
		numericOnly: true,
	});
	
	// Mobile news category menu
	var $trig = $("#navTrigger");
	var $nav = $("#navUl");
	$("#navTrigger").click(function(){
		if($nav.is(':visible')){
			$nav.slideUp();
			$trig.removeClass('active');
			$trig.html('+ Show Progress');
		}else{
			$nav.slideDown();
			$trig.addClass('active');
			$trig.html('- Hide Progress');
		}
	});
	
	// Prevent 404 when downloading agreement
	$("#downloadAgreement").click(function(e){
		$("#checkYourDownloads").slideDown();
	})
	
	//============================================================
	
	});	// End doc ready