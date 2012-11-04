define([
	"../utils"
], function (utils) {

	var Container = function (settings) {
		this.settings = settings;
		return this.render(settings);
	};

	Container.prototype = {
		dom : {},

		testInlineBlock : function (properties) {
			var display = properties["display"];
			var isFlex = (display === "flex");

			var dir = properties["flex-direction"];
			var isDirection = (dir === "row" || dir === "row-reverse");

			return (isFlex && isDirection);
		},

		setDisplay : function () {
			var container = this.container;
			var properties = container.properties;

			var items = this.dom.items;
			var i, j;

			var isInline = this.testInlineBlock(properties);
			utils.cleanWhitespace(this.dom.container);
		},

		render : function (settings) {
			this.container = settings.container;
			this.items = settings.items;

			this.dom.container = this.container.element;
			this.dom.items = utils.mapItems(this.items);

			this.setDisplay();
		}
	};

	return Container;

});
