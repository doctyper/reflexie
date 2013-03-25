Flexie.init = function (options) {
	// Check for native Flexbox support
	if (Flexie.support === true) {
		return true;
	}

	// Does not support flexbox.
	// But does it support other stuff we depend on?
	if (!("querySelectorAll" in document)) {
		throw new Error("Flexie needs `document.querySelectorAll`, but your browser doesn't support it.");
	}

	// Expose user options
	this.options = options;

	// Set up Event Emitter
	this.event = new Flexbox.event.emitter(options);

	// Expose API to redraw flexbox
	this.redraw = function () {
		return this.event.trigger("redraw");
	};

	// Load all stylesheets then feed them to the parser
	return new StyleLoader((function () {
		return function (stylesheets) {
			Flexbox.parser.onStylesLoaded(stylesheets);
		};
	}()));
};
