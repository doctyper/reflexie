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
		var rects = values.items,
			box = values.container,
			i, j, key, rect, item, element;

		this.applyStyles(id, container.selector, {
			"position": "relative",
			"width": box.width,
			"height": box.height
		});

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			rect = rects[i];

			this.applyStyles(id, item.selector, rect);
		}
	},

	detectAuto : function (element, box, prop) {
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
		var properties = ["Top", "Right", "Bottom", "Left"];

		if (window.getComputedStyle) {
			computed = getComputedStyle(element);

			for (i = 0, j = properties.length; i < j; i++) {
				prop = properties[i];
				values[prop.toLowerCase()] = parseFloat(computed[type + prop] || 0);
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

	getBoxSizing : function (style) {

		// Come on FF, get with the program
		if ("MozBoxSizing" in style) {
			return "MozBoxSizing";
		}

		return "boxSizing";
	},

	getPristineBox : function (element, position) {
		position = position || "absolute";

		var style = element.style;

		var oPos = style.position;
		var oFloat = style.cssFloat;
		var oClear = style.clear;

		var boxSizing = this.getBoxSizing(style);
		var oSize = style[boxSizing];

		style.position = "relative";
		style.cssFloat = "left";
		style.clear = "both";
		style[boxSizing] = "border-box";

		var sizeBox = element.getBoundingClientRect();
		var autoValues = this.detectAuto(element, sizeBox);

		style.position = oPos;
		style.cssFloat = oFloat;
		style.clear = oClear;
		style[boxSizing] = oSize;

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
			width: sizeBox.width,
			height: sizeBox.height,
			debug: {
				auto: autoValues,
				values: {
					width: widthValues,
					height: heightValues
				},
				border: border,
				margin: margin,
				padding: padding,
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

	clonePositionValues : function (values) {
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

		// console.log(css);

		if (style.styleSheet) {
			style.styleSheet.cssText += css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}
};
