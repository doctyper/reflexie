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

		storePositionValues : function (items) {
			var i, j, items;

			for (i = 0, j = items.length; i < j; i++) {
				item = items[i];
				item.rect = item.element.getBoundingClientRect();
			}

			return items;
		},

		applyPositioning : function (container, items) {
			var i, j, items, key,
				increment = 0;

			container.element.style.position = "relative";

			for (i = 0, j = items.length; i < j; i++) {
				item = items[i];
				item.element.style.position = "absolute";

				item.rect.top = items[0].rect.top;
				item.rect.bottom = items[0].rect.bottom;
				item.rect.left = increment;

				for (key in item.rect) {
					item.element.style[key] = item.rect[key];
				}

				increment += item.rect.width;
			}

			return items;
		},

		setDisplay : function () {
			var container = this.container;
			var properties = container.properties;

			var items = this.items;

			var isInline = this.testInlineBlock(properties);
			utils.cleanWhitespace(this.dom.container);

			if (isInline) {
				this.storePositionValues(items);
				this.applyPositioning(container, items);
			}
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
