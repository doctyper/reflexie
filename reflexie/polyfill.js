define([
	"./polyfill/container",
	"./polyfill/items",
	"./support"
], function (Container, Items, support) {
	var Flexbox = function (options) {
		this.options = options;
		return this.box(options);
	};

	Flexbox.prototype = {
		box : function (options) {
			if (support === true) {
				return true;
			}

			var container = new Container(options);
		}
	};

	return Flexbox;

});
