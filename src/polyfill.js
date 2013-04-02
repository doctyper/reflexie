var Flexie = function (settings) {
	this.settings = settings;
	return this.box(settings);
};

Flexie.prototype = {
	models : {
		order: Flexbox.models.order,
		flexDirection : Flexbox.models.flexDirection,
		flexWrap : Flexbox.models.flexWrap,
		// autoSize : Flexbox.models.autoSize,
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

	expandFlexFlow : function (properties) {
		var map = {
			"display": "flex",
			"flex-direction": "row",
			"flex-wrap": "nowrap",
			"justify-content": "flex-start",
			"align-items": "stretch",
			"align-content": "stretch"
		};

		var i, j;

		for (var key in properties) {
			var value = properties[key];

			if (key === "flex-flow") {
				value = value.split(" ");

				for (i = 0, j = value.length; i < j; i++) {
					var val = value[i];

					if (/row|column/.test(val)) {
						map["flex-direction"] = val;
					} else {
						map["flex-wrap"] = val;
					}
				}
			} else {
				map[key] = value;
			}
		}

		return map;
	},

	expandFlex : function (properties) {
		var map = {
			"align-self": "auto",
			"order": 0,
			"flex-grow": 0,
			"flex-shrink": 1,
			"flex-basis": "auto"
		};

		for (var key in properties) {
			var value = properties[key];
			var val, i, j;

			if (key === "flex") {
				value = value.split(" ");

				switch (value.length) {
				case 1:
					// Can be either of:
					// flex: initial;
					// flex: auto;
					// flex: none;
					// flex: <positive number>;
					// flex: <width-value>;

					val = value[0];

					if (!isNaN(val)) {
						// A single, valid integer is mapped to flex-grow
						// Equivalent to: "flex: <positive-number> 1 0px"
						map["flex-grow"] = val;
						map["flex-basis"] = "0px";
					} else {
						switch (val) {
						case "initial":
							// Equivalent to: "flex: 0 1 auto"
							break;

						case "auto":
							// Assume value is a width value, in which case
							// flex-grow: 1;
							// flex-shrink: default;
							// flex-basis: val;
							map["flex-grow"] = 1;
							map["flex-basis"] = val;
							break;

						case "none":
							// Equivalent to "flex: 0 0 auto"
							map["flex-shrink"] = 0;
							break;

						default:
							// Assume value is a width value, in which case
							// flex-grow: 1;
							// flex-shrink: default;
							// flex-basis: val;
							map["flex-grow"] = 1;
							map["flex-basis"] = val;
							break;
						}
					}
					break;
				case 2:
					// Can be either of:
					// flex: <flex-grow> <flex-basis>;
					// flex: <flex-basis> <flex-grow>;
					// flex: <flex-grow> <flex-shrink>;

					var hasNoBasis = !isNaN(value[0]) && !isNaN(value[1]);

					// If both are valid numbers, map to flex-grow and flex-shrink
					if (hasNoBasis) {
						map["flex-grow"] = value[0];
						map["flex-shrink"] = value[1];
					} else {
						// Map valid number to flex-grow, width value to flex-basis
						for (i = 0, j = value.length; i < j; i++) {
							val = value[i];

							if (!isNaN(val)) {
								map["flex-grow"] = val;
							} else {
								map["flex-basis"] = val;
							}
						}
					}
					break;
				case 3:
					var grown, shrunk, based;

					for (i = 0, j = value.length; i < j; i++) {
						val = value[i];

						if (!isNaN(val)) {
							if (!grown) {
								map["flex-grow"] = val;
								grown = true;
							} else if (!shrunk) {
								map["flex-shrink"] = val;
								shrunk = true;
							}
						} else {
							if (!based) {
								map["flex-basis"] = val;
								based = true;
							}
						}
					}
					break;
				}
			} else {
				map[key] = value;
			}
		}

		return map;
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
				item.properties = this.expandFlex(item.properties);
			}

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
