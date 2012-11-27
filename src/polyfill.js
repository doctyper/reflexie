Flexie = function (settings) {
	this.settings = settings;
	return this.box(settings);
};

Flexie.prototype = {
	box : function (settings) {
		if (Flexbox.support === true) {
			return true;
		}

		var container = new Flexbox.container(settings);
	}
};
