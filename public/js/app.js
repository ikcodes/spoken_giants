$(function () {
	//==============={  NAV BEHAVIOR  }===============//
	var didScroll = false;
	var lastScrollTop = 0;
	var delta = 5;
	var navPersists = 400; // How far down the page (px from top) does the nav persist?
	var navScrolled = false;

	$(window).scroll(function () {
		var height = $(window).scrollTop();
		didScroll = true;
		hasScrolled(height);
		runNavState(height);
	});

	function runNavState(height) {
		if (height <= navPersists) {
			$("#nav").removeClass("scrolled");
			navScrolled = false;
		}
		if (height >= navPersists && navScrolled == false) {
			$("#nav").addClass("scrolled");
			navScrolled = true;
		}
	}

	function hasScrolled(height) {
		// Detect scroll direction
		var top = height;
		if (Math.abs(lastScrollTop - top) <= delta) {
			return;
		}
		if (top > lastScrollTop && top > delta && top > navPersists) {
			// Scrolling Down
		} else {
			// Scrolling up
			$("#nav").removeClass("scrolled");
		}
		lastScrollTop = top;
	}

	// Toggle nav menu
	$("#nav-button").click(function () {
		if (!$(this).hasClass("open")) {
			$("#nav-button, #hamburger, #navItems")
				.removeClass("closed")
				.addClass("open");
		} else {
			$("#nav-button, #hamburger, #navItems")
				.removeClass("open")
				.addClass("closed");
		}
	});

	$(document).foundation(); // Keep this last.
});
