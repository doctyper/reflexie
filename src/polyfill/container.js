Flexbox.container = (function () {
	var utils = Flexbox.utils;
	var models = Flexbox.models;

	Flexbox.dimValues = {
		"left": "width",
		"top": "height"
	};

	var container = function (settings) {
		this.settings = settings;
		return this.render(settings);
	};

	container.prototype = {
		models : {
			order: models.order,
			flexDirection : models.flexDirection,
			flexWrap : models.flexWrap,
			justifyContent : models.justifyContent,
			alignItems : models.alignItems,
			alignContent : models.alignContent
		},

		generateUID : function (container) {
			if (this.uid) {
				return this.uid;
			}

			var selector = container.selector;
			selector = selector.replace(/\#/g, "id-");
			selector = selector.replace(/\./g, "class-");
			selector = selector.replace(/\:/g, "pseudo-");
			selector = selector.replace(/\s/g, "-");

			this.uid = "flexie-" + selector;
			return this.uid;
		},

		expandFlexFlow : function (properties) {
			var map = {};
			var longHands = ["direction", "wrap"];
			var i, j;

			for (var key in properties) {
				var value = properties[key];

				if (key === "flex-flow") {
					value = value.split(" ");

					for (i = 0, j = value.length; i < j; i++) {
						map["flex-" + longHands[i]] = value[i];
					}
				} else {
					map[key] = value;
				}
			}

			return map;
		},

		render : function (settings) {
			this.uid = this.generateUID(settings.container);

			// Clean DOM, remove pre-existing styles
			utils.removeStyles(this.uid);

			this.container = settings.container;
			this.items = settings.items;

			this.dom = this.dom || {};
			this.dom.values = utils.storePositionValues(this.container, this.items);
			this.values = utils.clonePositionValues(this.dom.values, this.items);

			// Handle `flex-flow` shorthand property
			var properties = this.expandFlexFlow(this.container.properties);
			var models = this.models;

			// So the way this works:
			//
			// All properties get a chance to override each other, in this order:
			// - order
			// - flex-direction
			// - flex-wrap
			// - justify-content
			// - align-content
			// - align-items
			//
			// `this.items` is modified (if needed) by each property method,
			// adjusting for positioning (if necessary).
			//
			// The result is then written to the DOM using only one write cycle.

			for (var key in models) {
				var prop = utils.toDashedCase(key);
				models[key].call(this, properties[prop], properties);
			}

			// Final positioning
			Flexbox.utils.applyPositioning(this.uid, this.container, this.items, this.values);
		}
	};

	return container;

}());
