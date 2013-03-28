Flexie = function (settings) {
	this.settings = settings;
	return this.box(settings);
};

Flexie.prototype = {
	box : function (settings) {
		if (Flexie.support === true) {
			return true;
		}

		return new Flexbox.container(settings);
	}
};
