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

	// no native Flexbox support, use polyfill
	Flexie.init();
});
