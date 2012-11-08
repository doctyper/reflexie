Flexbox.support = (function () {
	var testProp = "flexWrap";
	var prefixes = "webkit moz o ms".split(" ");
	var dummy = document.createElement("flx");
	var i, j, prop;

	var typeTest = function (prop) {
		return typeof dummy.style[prop] !== "undefined";
	};

	var flexboxSupport = typeTest(testProp);

	if (!flexboxSupport) {
		testProp = testProp.charAt(0).toUpperCase() + testProp.slice(1);

		for (i = 0, j = prefixes.length; i < j; i++) {
			prop = prefixes[i] + testProp;
			flexboxSupport = typeTest(prop);

			if (flexboxSupport) {
				break;
			}
		}
	}

	return flexboxSupport;
}());
