var Flexie = function (settings) {
	this.settings = settings;
	return this.box(settings);
};

Flexie.prototype = {
	models : {
		order: Flexbox.models.order,
		flexDirection : Flexbox.models.flexDirection,
		flexWrap : Flexbox.models.flexWrap,
		flexGrow : Flexbox.models.flexGrow,
		alignContentStretch : Flexbox.models.alignContent,
		justifyContent : Flexbox.models.justifyContent,
		alignItems : Flexbox.models.alignItems,
		alignSelf : Flexbox.models.alignSelf,
		alignContent : Flexbox.models.alignContent
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

		this.uid = "flexie-" + selector + "-" + (++Flexbox.count);
		return this.uid;
	},

	render : function (settings) {
		var utils = Flexbox.utils;

		this.uid = this.generateUID(settings.container);

		// Clean DOM, remove pre-existing styles
		utils.removeStyles(this.uid);

		this.container = settings.container;
		this.items = settings.items;

		if (settings.partial !== true) {
			// Expand flex property to individual rules
			var i, j, item;

			for (i = 0, j = this.items.length; i < j; i++) {
				item = this.items[i];
				item.properties = utils.expandFlex(item.properties);
			}

			this.dom = this.dom || {};
			this.dom.values = utils.storePositionValues(this.container, this.items);
			this.values = utils.clonePositionValues(this.dom.values, this.items);

			// Handle `flex-flow` shorthand property
			var properties = utils.expandFlexFlow(this.container.properties);
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
				models[key].call(this, properties[prop], properties, key);
			}

			// Final positioning
			utils.applyPositioning(this.uid, this.container, this.items, this.values);
		} else {
			utils.applyPartialValues(this.uid, this.container, this.items);
		}

		// Emit complete
		Flexie.event.trigger("complete", {
			uid: this.uid,
			container: this.container,
			items: this.items
		});
	},

	box : function (settings) {
		if (Flexie.support === true) {
			return true;
		}

		return this.render(settings);
	}
};
