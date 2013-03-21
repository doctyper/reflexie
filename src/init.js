Flexie.init = function () {
	// Load all stylesheets then feed them to the parser
	var loader = new StyleLoader((function () {
		return function (stylesheets) {
			Flexbox.parser.onStylesLoaded(stylesheets);
		};
	}()));
};

domReady(function () {
	// Check for native Flexbox support
	if (Flexbox.support === true) {
		return true;
	}

	// Does not support flexbox.
	// But does it support other stuff we depend on?
	if (!("querySelectorAll" in document)) {
		throw new Error("Flexie needs `document.querySelectorAll`, but your browser doesn't support it.");
	}

	// no native Flexbox support, use polyfill
	Flexie.init();
});
