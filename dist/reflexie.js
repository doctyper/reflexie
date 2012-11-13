/*!
 * Reflexie 0.0.0
 *
 * Copyright (c) Richard Herrera

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Date: 11-13-2012
 */
(function (window, undefined) {

	"use strict";

	var Flexie;

	var Flexbox = {};
	Flexbox.models = {};
	
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

		getPristineBox : function (element, position) {
			position = position || "absolute";

			var style = element.style;

			var oPos = style.position;
			var oFloat = style.cssFloat;
			var oClear = style.clear;

			style.position = "relative";
			style.cssFloat = "left";
			style.clear = "both";

			var box = element.getBoundingClientRect();
			var autoValues = this.detectAuto(element, box);

			style.position = oPos;
			style.cssFloat = oFloat;
			style.clear = oClear;

			if (element.getAttribute("style") === "") {
				element.removeAttribute("style");
			}

			return {
				position: position,
				left: box.left,
				top: box.top,
				width: box.width,
				height: box.height,
				auto: autoValues
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
	
	Flexbox.support = (function () {
		var testProp = "flexWrap";
		var prefixes = "webkit moz o ms".split(" ");
		var dummy = document.createElement("flx");
		var i, j, prop;

		var typeTest = function (prop) {
			return typeof dummy.style[prop] !== "undefined";
		};

		var flexboxSupport = typeTest(testProp);

		if (!flexboxSupport) {
			testProp = testProp.charAt(0).toUpperCase() + testProp.slice(1);

			for (i = 0, j = prefixes.length; i < j; i++) {
				prop = prefixes[i] + testProp;
				flexboxSupport = typeTest(prop);

				if (flexboxSupport) {
					return flexboxSupport;
				}
			}
		}

		return flexboxSupport;
	}());
	
	
	Flexbox.models.flexDirection = function (direction, properties) {
		var values = this.values,
			utils = Flexbox.utils,
			containerValues = values.container,
			itemValues = values.items,
			i, j, item, incrementVal = 0,
			colArray = ["column", "column-reverse"],
			revArray = ["row-reverse", "column-reverse"],
			isColumn = utils.assert(direction, colArray),
			isReverse = utils.assert(direction, revArray),
			needsIncrement = (!isColumn || isReverse),
			crossStart = (isColumn ? "left" : "top"),
			mainStart = (isColumn ? "top" : "left"),
			mainSize = Flexbox.dimValues[mainStart],
			crossSize = Flexbox.dimValues[crossStart],
			storedVal = itemValues[0][crossStart],
			containerVal = containerValues[mainSize];

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];
			item[crossStart] = storedVal;

			if (isReverse) {
				item[mainStart] = (containerVal - item[mainSize]) - incrementVal;
			} else {
				item[mainStart] = item[mainStart] + incrementVal;
			}

			if (needsIncrement) {
				incrementVal += item[mainSize];
			}
		}

		// flex-direction sets which properties need updates
		// Expose these for use later.
		this.crossStart = crossStart;
		this.mainStart = mainStart;

		this.mainSize = mainSize;
		this.crossSize = crossSize;

		// console.log("crossStart", this.crossStart);
		// console.log("mainStart", this.mainStart);
		// console.log("crossSize", this.crossSize);
		// console.log("mainSize", this.mainSize);

	};
	
	Flexbox.models.flexWrap = function (wrap, properties) {
		var values = this.values;
		var itemValues = values.items;

		var i, j;

		var isWrap = (wrap === "wrap");
		var isWrapReverse = (wrap === "wrap-reverse");

		var crossStart = this.crossStart;
		var mainStart = this.mainStart;

		var mainSize = this.mainSize;
		var crossSize = this.crossSize;

		var containerSize = values.container[mainSize];
		var lines = [];

		var line = {
			items: [],
			totalSize: 0
		};

		// TODO: Implement `flex-wrap: wrap-reverse;`
		if (isWrap || isWrapReverse) {
			var storedVal = itemValues[0][mainStart],
				breakpoint = containerSize,
				maxMainStart = 0,
				persistAxis, size, item,
				itemMainStart, prevSize,
				currMainSize,
				currCrossSize;

			for (i = 0, j = itemValues.length; i < j; i++) {
				item = itemValues[i];

				currMainSize = item[mainSize];
				currCrossSize = item[crossSize];
				itemMainStart = item[mainStart];
				size = itemMainStart + currMainSize;

				if (size > breakpoint) {
					if (!persistAxis) {
						persistAxis = maxMainStart;
						storedVal += itemMainStart;

						lines.push(line);

						line = {
							items: [],
							totalSize: 0
						};
					}

					if (size > (breakpoint + containerSize)) {
						persistAxis += maxMainStart;
						breakpoint += (containerSize - prevSize);
						storedVal = itemMainStart;

						maxMainStart = 0;

						lines.push(line);

						line = {
							items: [],
							totalSize: 0
						};
					}

					item[crossStart] = persistAxis;
					item[mainStart] -= storedVal;
				}

				line.items.push(item);

				line.totalSize += item[mainSize];

				maxMainStart = Math.max(maxMainStart, currCrossSize);
				prevSize = item[mainStart] + item[mainSize];
			}
		} else {
			line.items = values.items;
		}

		lines.push(line);

		// Expose lines
		this.lines = lines;
	};
	
	Flexbox.models.justifyContent = function (justification, properties) {
		var values = this.values,
			utils = Flexbox.utils,
			containerValues = values.container,
			mainStart = this.mainStart,
			mainSize = this.mainSize,
			containerSize = containerValues[mainSize],
			isStart = (justification === "flex-start"),
			isCenter = (justification === "center"),
			isBetween = (justification === "space-between"),
			isAround = (justification === "space-around"),
			revArray = ["row-reverse", "column-reverse"],
			isReverse = utils.assert(properties["flex-direction"], revArray),
			lines = this.lines,
			i, j, k, l, line, items,
			lineRemainder, multiplier = 1, x, y;

		isReverse = (isReverse) ? -1 : 1;

		if (isStart) {
			return;
		}

		if (isCenter) {
			multiplier = 0.5;
		}

		for (i = 0, j = lines.length; i < j; i++) {
			x = 0;
			line = lines[i];
			items = line.items;
			l = items.length;

			lineRemainder = containerSize;

			for (k = 0; k < l; k++) {
				lineRemainder -= items[k][mainSize];
			}

			lineRemainder *= multiplier;
			k = 0;

			if (isBetween || isAround) {
				k = 1;
				lineRemainder /= (l - (isBetween ? 1 : 0));
				x = lineRemainder;

				if (isAround) {
					y = (lineRemainder * 0.5);
					items[0][mainStart] += (y * isReverse);
					lineRemainder += y;
				}
			}

			for (; k < l; k++) {
				items[k][mainStart] += (lineRemainder * isReverse);
				lineRemainder += x;
			}
		}
	};
	
	Flexbox.models.alignItems = function (alignment, properties) {
		var crossStart = this.crossStart,
			crossSize = this.crossSize,
			multiplier = 1,
			lines = this.lines,
			i, j, k, l, line, items, item,
			lineRemainder;

		var values = this.values;
		var mainSize = this.mainSize;
		var containerSize = values.container[mainSize];

		var isStretch = (alignment === "stretch");
		var isStart = (alignment === "flex-start");
		var isBaseline = (alignment === "baseline");
		var isCenter = (alignment === "center");

		var isNotFlexWrap = properties["flex-wrap"] === "nowrap";
		var isAlignContentStretch = properties["align-content"] === "stretch";

		if (isStretch && (isNotFlexWrap || isAlignContentStretch)) {
			items = values.items;
			lineRemainder = values.container[crossSize] / lines.length;

			for (i = 0, j = lines.length; i < j; i++) {
				line = lines[i];
				items = line.items;
				l = items.length;

				for (k = 0; k < l; k++) {
					item = items[k];

					if (item.auto[crossSize]) {
						if (i) {
							item[crossStart] += (lineRemainder * i) - item[crossSize];
						}

						item[crossSize] = lineRemainder;
					}
				}
			}
		}

		if (isStretch || isStart || isBaseline) {
			return;
		}

		if (isCenter) {
			multiplier = 0.5;
		}

		var remainderSize = containerSize;

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;

			for (k = 0; k < l; k++) {
				line.maxItemSize = Math.max(line.maxItemSize || 0, items[k][crossSize]);
			}

			remainderSize -= line.maxItemSize;
		}

		remainderSize /= lines.length;

		if (isCenter) {
			remainderSize *= 0.5;
		}

		if (lines.length <= 1 && !isNotFlexWrap && !isAlignContentStretch) {
			remainderSize = 0;
		}

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;
			lineRemainder = line.maxItemSize;

			for (k = 0; k < l; k++) {
				items[k][crossStart] += remainderSize + (lineRemainder - items[k][crossSize]) * multiplier;
			}
		}
	};
	
	Flexbox.models.alignContent = function (alignment, properties) {
		var values = this.values,
			containerValues = values.container,

			crossStart = this.crossStart,
			mainStart = this.mainStart,

			mainSize = this.mainSize,
			crossSize = this.crossSize,

			containerSize = containerValues[crossSize],
			isStart = (alignment === "flex-start"),
			isCenter = (alignment === "center"),
			isBetween = (alignment === "space-between"),
			isAround = (alignment === "space-around"),
			isStretch = (alignment === "stretch"),
			isNotFlexWrap = (properties["flex-wrap"] === "nowrap"),
			lines = this.lines,
			i, j, k, l, line, items, item,
			lineEnd, lineRemainder,
			multiplier = 1, x, y;

		// http://www.w3.org/TR/css3-flexbox/#align-content-property
		//  Note, this property has no effect when the flexbox has only a single line.
		if (lines.length <= 1) {
			if (isNotFlexWrap) {
				return;
			} else if (isAround) {
				isAround = false;
				isCenter = true;
			}
		}

		if (isStart) {
			return;
		}

		if (isCenter) {
			multiplier = 0.5;
		}

		lineRemainder = containerSize;

		for (i = 0, j = lines.length; i < j; i++) {
			x = 0;
			line = lines[i].items;

			for (k = 0, l = line.length; k < l; k++) {
				x = Math.max(x, line[k][crossSize]);
			}

			lineRemainder -= x;
		}

		i = 0;

		if (isBetween || isAround || isStretch) {
			i = 1;
			lineRemainder /= (l - (isBetween ? 2 : 1));
			x = lineRemainder;

			if (isAround) {
				y = (lineRemainder * 0.5);
				items = lines[0].items;

				for (x = 0, j = items.length; x < j; x++) {
					items[x][crossStart] += y;
				}

				lineRemainder += y;
			}
		}

		for (j = lines.length; i < j; i++) {
			item = lines[i].items;

			for (k = 0, l = item.length; k < l; k++) {
				item[k][crossStart] += (lineRemainder * multiplier);
			}
		}
	};
	
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
	
	Flexbox.items = (function () {
		var Items = function (properties) {
			this.properties = properties;
			return this.render(properties);
		};

		Items.prototype = {
			render : function () {

			}
		};

		return Items;
	}());
	
	Flexie = function (options) {
		this.options = options;
		return this.box(options);
	};

	Flexie.prototype = {
		box : function (options) {
			if (Flexbox.support === true) {
				return true;
			}

			var container = new Flexbox.container(options);
		}
	};
	
	// Uses AMD or browser globals to create a module.
	if (typeof define === "function" && define.amd) {
		define(function () {
			return Flexie;
		});
	} else {
		window.Flexie = Flexie;
	}
	
})(window);
