define([
	"../utils"
], function (utils) {
	"use strict";

	var dimValues = {
		"left": "width",
		"top": "height"
	};

	var applyPositioning = function (id, container, items, values) {
		var rects = values.items,
			box = values.container,
			i, j, key, rect, item, element;

		utils.applyStyles(id, container.selector, {
			"position": "relative",
			"width": box.width,
			"height": box.height
		});

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			rect = rects[i];

			utils.applyStyles(id, item.selector, rect);
		}
	};

	var getPristineBox = function (element, position) {
		position = position || "absolute";
		var box = element.getBoundingClientRect();

		return {
			position: position,
			left: box.left,
			top: box.top,
			width: box.width,
			height: box.height
		};
	};

	var storePositionValues = function (container, items) {
		var i, j;
		var box = getPristineBox(container.element, "relative");
		var children = [];

		for (i = 0, j = items.length; i < j; i++) {
			children.push(getPristineBox(items[i].element));
		}

		return {
			container: box,
			items: children
		};
	};

	var clonePositionValues = function (values) {
		var key, i, j, newItem;

		var newValues = {
			container: {},
			items: []
		};

		for (key in values.container) {
			newValues.container[key] = values.container[key];
		}

		for (i = 0, j = values.items.length; i < j; i++) {
			newItem = {};

			for (key in values.items[i]) {
				newItem[key] = values.items[i][key];
			}

			newValues.items.push(newItem);
		}

		return newValues;
	};

	var Container = function (settings) {
		this.settings = settings;
		return this.render(settings);
	};

	Container.prototype = {
		model : {
			flexDirection : function (direction, properties) {
				var values = this.values,
					containerValues = values.container,
					itemValues = values.items,
					i, j, item, incrementVal = 0,
					colArray = ["column", "column-reverse"],
					revArray = ["row-reverse", "column-reverse"],
					isColumn = utils.assert(direction, colArray),
					isReverse = utils.assert(direction, revArray),
					needsIncrement = (!isColumn || isReverse),
					primaryAxis = (isColumn ? "left" : "top"),
					secondaryAxis = (isColumn ? "top" : "left"),
					primaryDimension = dimValues[secondaryAxis],
					secondaryDimension = dimValues[primaryAxis],
					storedVal = itemValues[0][primaryAxis],
					containerVal = containerValues[primaryDimension];

				for (i = 0, j = itemValues.length; i < j; i++) {
					item = itemValues[i];
					item[primaryAxis] = storedVal;

					if (isReverse) {
						item[secondaryAxis] = (containerVal - item[primaryDimension]) - incrementVal;
					} else {
						item[secondaryAxis] = item[secondaryAxis] + incrementVal;
					}

					if (needsIncrement) {
						incrementVal += item[primaryDimension];
					}
				}

				// flex-direction sets which properties need updates
				// Expose these for use later.
				this.primaryAxis = primaryAxis;
				this.secondaryAxis = secondaryAxis;

				this.primaryDimension = primaryDimension;
				this.secondaryDimension = secondaryDimension;
			},

			flexWrap : function (wrap, properties) {
				// var container = this.container;
				// var items = this.items;
				var values = this.values;
				var itemValues = values.items;

				var i, j;

				var primaryAxis = this.primaryAxis;
				var secondaryAxis = this.secondaryAxis;

				var primaryDimension = this.primaryDimension;
				var secondaryDimension = this.secondaryDimension;

				var containerSize = values.container[primaryDimension];

				if (wrap === "wrap" || wrap === "wrap-reverse") {
					var storedVal = itemValues[0][secondaryAxis],
						breakpoint = containerSize,
						maxSecondaryAxis = 0,
						persistAxis, size, item,
						itemSecondaryAxis, prevSize,
						currPrimaryDimension,
						currSecondaryDimension;

					for (i = 0, j = itemValues.length; i < j; i++) {
						item = itemValues[i];

						currPrimaryDimension = item[primaryDimension];
						currSecondaryDimension = item[secondaryDimension];
						itemSecondaryAxis = item[secondaryAxis];
						size = itemSecondaryAxis + currPrimaryDimension;

						if (size > breakpoint) {
							if (!persistAxis) {
								persistAxis = maxSecondaryAxis;
								storedVal += itemSecondaryAxis;
							}

							if (size > (breakpoint + containerSize)) {
								persistAxis += maxSecondaryAxis;
								breakpoint += (containerSize - prevSize);
								storedVal = itemSecondaryAxis;

								maxSecondaryAxis = 0;
							}

							item[primaryAxis] = persistAxis;
							item[secondaryAxis] -= storedVal;
						}

						maxSecondaryAxis = Math.max(maxSecondaryAxis, currSecondaryDimension);
						prevSize = item[secondaryAxis] + item[primaryDimension];
					}
				}
			}
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
			this.dom.values = storePositionValues(this.container, this.items);
			this.values = clonePositionValues(this.dom.values);

			var properties = this.container.properties;
			var model = this.model;

			/*for (var key in properties) {
				var func = utils.toCamelCase(key);

				if (model[func]) {
					model[func].call(this, properties[key], properties);
				}
			}*/
			this.model.flexDirection.call(this, properties["flex-direction"], properties);
			this.model.flexWrap.call(this, properties["flex-wrap"], properties);

			applyPositioning(this.uid, this.container, this.items, this.values);
		}
	};

	return Container;

});
