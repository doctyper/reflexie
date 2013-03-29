Flexbox.utils = {
	assert : function (prop, values) {
		var i, j, isValue = false;

		for (i = 0, j = values.length; i < j; i++) {
			if (prop === values[i]) {
				isValue = true;
				break;
			}
		}

		return isValue;
	},

	toCamelCase : function (str) {
		return str.replace(/\W+(.)/g, function (x, chr) {
			return chr.toUpperCase();
		});
	},

	toDashedCase : function (str) {
		return str.replace(/([A-Z])/g, function ($1) {
			return "-" + $1.toLowerCase();
		});
	},

	// Copyright (C) 2011 Alex Kloss <alexthkloss@web.de>
	// DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
	keys : function (object) {
		return (Object.keys || function (object, key, result) {
			// initialize object and result
			result = [];

			// iterate over object keys
			for (key in object) {

				// fill result array with non-prototypical keys
				if (result.hasOwnProperty.call(object, key)) {
					result.push(key);
				}

				// return result
				return result;
			}
		}).call(object, object);
	},

	matchesSelector : function (elem, selector) {
		return (Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || function (selector) {
			var els = document.querySelectorAll(selector),
				i, j;

			for (i = 0, j = els.length; i < j; i++) {
				if (els[i] === this) {
					return true;
				}
			}

			return false;
		}).call(elem, selector);
	},

	nthChildSupport : function () {
		// For nth-child testing, I assume your browser supports querySelector
		return (function () {
			var dummy = document.createElement('div');
			dummy.innerHTML += '<p></p>';

			return dummy.querySelector("p:nth-child(1)");
		}());
	},

	testValue : function (val) {
		var dimensions = ["left", "top", "right", "bottom", "width", "height"],
			i, j;

		for (i = 0, j = dimensions.length; i < j; i++) {
			if (dimensions[i] === val) {
				return true;
			}
		}

		return false;
	},

	applyPositioning : function (id, container, items, values) {
		var display = container.properties.display,
			rects = values.items,
			box = values.container,
			i, j, rect, item;

		this.applyStyles(id, container.selector, {
			"position": "relative",
			"width": box.width,
			"height": box.height,
			"display": display.replace("flex", "block")
		});

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			rect = rects[i];

			this.applyStyles(id, item.selector, rect);
		}
	},

	detectAuto : function (element, box) {
		var autoBox,
			oWidth = element.style.width,
			oHeight = element.style.height,
			autoWidth = false,
			autoHeight = false;

		element.style.width = "auto";
		element.style.height = "auto";

		autoBox = element.getBoundingClientRect();
		autoWidth = autoBox.width === box.width;
		autoHeight = autoBox.height === box.height;

		element.style.width = oWidth;
		element.style.height = oHeight;

		return {
			width: autoWidth,
			height: autoHeight
		};
	},

	getValues : function (element, type) {
		var i, j;
		var prop;
		var computed;
		var values = {};
		var suffix = "";
		var properties = ["Top", "Right", "Bottom", "Left"];

		if (window.getComputedStyle) {
			computed = getComputedStyle(element);

			if (type === "border") {
				suffix = "Width";
			}

			for (i = 0, j = properties.length; i < j; i++) {
				prop = properties[i];
				values[prop.toLowerCase()] = parseFloat(computed[type + prop + suffix] || 0);
			}
		}

		values.topTotal = values.top + values.bottom;
		values.leftTotal = values.left + values.right;

		return values;
	},

	getBorderValues : function (element) {
		return this.getValues(element, "border");
	},

	getMarginValues : function (element) {
		return this.getValues(element, "margin");
	},

	getPaddingValues : function (element) {
		return this.getValues(element, "padding");
	},

	getPristineBox : function (element, position) {
		position = position || "absolute";

		var style = element.style;

		var oPos = style.position;
		var oFloat = style.cssFloat;
		var oClear = style.clear;

		style.position = "relative";
		style.cssFloat = "left";
		style.clear = "both";

		var sizeBox = element.getBoundingClientRect();
		var autoValues = this.detectAuto(element, sizeBox);

		style.position = oPos;
		style.cssFloat = oFloat;
		style.clear = oClear;

		var marginBox = element.getBoundingClientRect();

		if (element.getAttribute("style") === "") {
			element.removeAttribute("style");
		}

		var border = this.getBorderValues(element);
		var margin = this.getMarginValues(element);
		var padding = this.getPaddingValues(element);

		var widthValues = (margin.left + margin.right);
		widthValues += (padding.left + padding.right);
		widthValues += (border.left + border.right);

		var heightValues = (margin.top + margin.bottom);
		heightValues += (padding.top + padding.bottom);
		heightValues += (border.top + border.bottom);

		return {
			position: position,
			left: marginBox.left,
			top: marginBox.top,
			width: sizeBox.width - (padding.left + padding.right) - (border.left + border.right),
			height: sizeBox.height - (padding.top + padding.bottom) - (border.top + border.bottom),
			debug: {
				auto: autoValues,
				values: {
					width: widthValues,
					height: heightValues
				},
				border: border,
				margin: margin,
				padding: padding,
				inner: {
					left: (padding.left + padding.right) + (border.left + border.right),
					top: (padding.top + padding.bottom) + (border.top + border.bottom)
				},
				width: sizeBox.width + widthValues,
				height: sizeBox.height + heightValues
			}
		};
	},

	storePositionValues : function (container, items) {
		var i, j;
		var box = this.getPristineBox(container.element, "relative");
		var children = [];

		for (i = 0, j = items.length; i < j; i++) {
			children.push(this.getPristineBox(items[i].element));
		}

		return {
			container: box,
			items: children
		};
	},

	clonePositionValues : function (values, items) {
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

			newItem.debug.properties = items[i].properties;
			newValues.items.push(newItem);
		}

		return newValues;
	},

	JSONToStyles : function (selector, styles) {
		var rules = [selector + " {"];
		var value, isDimension;

		for (var key in styles) {
			value = styles[key];

			if (typeof value === typeof {}) {
				break;
			}

			isDimension = this.testValue(key);

			if (isDimension && typeof value === "number") {
				value = value.toString() + "px";
			}

			rules.push(key + ": " + value + " !important;");
		}

		rules = "\n" + rules.join("\n\t") + "\n}" + "\n";
		return rules;
	},

	removeStyles : function (id) {
		var existing = document.getElementById(id);

		if (existing) {
			existing.parentNode.removeChild(existing);
		}
	},

	applyStyles : function (id, selector, styles) {
		var css = this.JSONToStyles(selector, styles),
			head = document.getElementsByTagName("head")[0],
			existing = document.getElementById(id),
			style = existing || document.createElement("style");

		if (!existing) {
			style.id = id;
			style.type = "text/css";
		}

		if (style.styleSheet) {
			style.styleSheet.cssText += css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	},

	flexBasisToPx : function (flexBasis, currLength, containerSize) {
		if (typeof flexBasis === "undefined" || flexBasis === "auto") {
			return currLength;
		} else if (flexBasis === "0") {
			return 0;
		} else if (flexBasis.slice(-2) === "px") {
			return parseFloat(flexBasis.slice(0, -2));
		} else if (flexBasis.slice(-1) === "%") {
			return containerSize * 0.01 * parseFloat(flexBasis.slice(0, -1));
		}
		// TODO: implent other lengths, probably by a slow DOM insertion & measurement
	}
};
