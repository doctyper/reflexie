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

		render : function (settings) {
			this.uid = this.generateUID(settings.container);

			// Clean DOM, remove pre-existing styles
			utils.removeStyles(this.uid);

			this.container = settings.container;
			this.items = settings.items;

			this.dom = this.dom || {};
			this.dom.values = utils.storePositionValues(this.container, this.items);
			this.values = utils.clonePositionValues(this.dom.values);

			var properties = this.container.properties;
			var models = this.models;

			// So the way this works:
			//
			// All properties get a chance to override each other, in this order:
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

			for (var key in properties) {
				var func = utils.toCamelCase(key);

				if (models[func]) {
					models[func].call(this, properties[key], properties);
				}
			}

			utils.applyPositioning(this.uid, this.container, this.items, this.values);
		}
	};

	return container;

}());
