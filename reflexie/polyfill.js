Flexie = function (options) {
	this.options = options;
	return this.box(options);
};

Flexie.prototype = {
	box : function (options) {
		if (Flexbox.support === true) {
			return true;
		}

		var container = new Flexbox.container(options);
	}
};
