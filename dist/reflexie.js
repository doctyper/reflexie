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
 * Date: 3-18-2013
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

		toDashedCase : function (str) {
			return str.replace(/([A-Z])/g, function ($1) {
				return "-" + $1.toLowerCase();
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
	
	
	Flexbox.models.order = function (properties) {
		this.items.sort(function (a, b) {
			var aProps = a.properties;
			var bProps = b.properties;

			if (!aProps || !bProps) {
				return;
			}

			return aProps.order - bProps.order;
		});

		this.values.items.sort(function (a, b) {
			var aProps = a.debug.properties;
			var bProps = b.debug.properties;

			if (!aProps || !bProps) {
				return;
			}

			return aProps.order - bProps.order;
		});
	};
	
	Flexbox.models.alignSelf = function (alignment, properties) {
		var crossStart = this.crossStart,
			crossSize = this.crossSize,
			multiplier = 1,
			lines = this.lines,
			i, j, k, l, line, items, item,
			lineRemainder;

		var values = this.values;
		var mainSize = this.mainSize;
		var containerSize = values.container[mainSize];

		var mainStart = this.mainStart;
		var crossTotal = crossStart + "Total";

		var isNotFlexWrap = properties["flex-wrap"] === "nowrap";

		var alignSelf, lineSize;
		var isAuto, isStart, isCenter, isStretch;

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];

			for (i = 0, j = line.items.length; i < j; i++) {
				item = line.items[i];

				if (!item.debug || !item.debug.properties) {
					return;
				}

				alignSelf = item.debug.properties["align-self"];

				isAuto = alignSelf === "auto";
				isStart = alignSelf === "flex-start";
				isCenter = alignSelf === "center";
				isStretch = alignSelf === "stretch";

				lineSize = (isNotFlexWrap) ? containerSize : line.maxItemSize;
				lineSize -= item.debug.inner[crossStart];
				lineSize -= item.debug.margin[crossTotal];

				if (isStretch) {
					if (item.debug.auto[crossSize]) {
						item[crossSize] = lineSize;
					}
				} else if (!isAuto && !isStart) {
					if (isCenter) {
						multiplier = 0.5;
					}

					item[crossStart] += (lineSize - item[crossSize]) * multiplier;
				}
			}
		}
	};
	
	Flexbox.models.flexGrow = function (flewGrow, properties) {
		// Check for space, otherwise exit
		var values = this.values,
			container = values.container,

			crossStart = this.crossStart,
			mainStart = this.mainStart,

			mainSize = this.mainSize,
			crossSize = this.crossSize,

			containerMainSize = container[mainSize],
			containerCrossSize = container[crossSize],
			lines = this.lines;

		var utils = Flexbox.utils,
			colArray = ["column", "column-reverse"],
			revArray = ["row-reverse", "column-reverse"],
			flexDirection = properties["flex-direction"],
			isColumn = utils.assert(flexDirection, colArray),
			isReverse = utils.assert(flexDirection, revArray);

		var i, ilim, j, jlim, line, noOfItems, usedSpace,
			availSpace, flexTotal, curr, runningDiff, dir;

		for (i = 0, ilim = lines.length; i < ilim; i++) {
			line = lines[i];
			noOfItems = line.items.length;

			// TODO Properly: calculate hypothetical main and cross size of each item
			// Currently just use width/height (i.e. borders will currently make this wrong!)

			usedSpace = 0;
			for (j = 0; j < noOfItems; j++) {
				usedSpace += line.items[j][mainSize];
			}

			// TODO Properly: Determine the available main and cross space for the flex items (9.2)
			// Currently just using containerMainSize

			availSpace = containerMainSize - usedSpace;

			if (availSpace < 0) {
				// Need flex-shrink rather than flex-grow
				return properties;
			}

			flexTotal = 0;
			for (j = 0; j < noOfItems; j++) {
				curr = line.items[j].debug.properties["flex-grow"];
				if (!curr || isNaN(curr) || curr < 0) {
					curr = line.items[j].debug.properties["flex-grow"] = 0;
				}
				flexTotal += curr;
			}

	
			if (flexTotal <= 0) {
				// Nothing can grow - do nothing!
				return properties;
			}

			// TODO: Implent min/max-width/height support
			runningDiff = 0;
			dir = (isReverse ?  -1 : 1);
			for (j = 0; j < noOfItems; j++) {
				curr = (availSpace * line.items[j].debug.properties["flex-grow"]) / flexTotal;
				line.items[j][mainStart] += (isReverse ?  -runningDiff - curr : runningDiff);
				line.items[j][mainSize] += curr;
				runningDiff += curr;
			}
		}

	};
	Flexbox.models.flexDirection = function (direction, properties) {
		var values = this.values,
			container = values.container,
			itemValues = values.items,
			i, j, item, incrementVal = 0,
			utils = Flexbox.utils,
			colArray = ["column", "column-reverse"],
			revArray = ["row-reverse", "column-reverse"],
			isColumn = utils.assert(direction, colArray),
			isReverse = utils.assert(direction, revArray),
			needsIncrement = (!isColumn || isReverse),
			crossStart = (isColumn ? "left" : "top"),
			mainStart = (isColumn ? "top" : "left"),
			mainSize = Flexbox.dimValues[mainStart],
			crossSize = Flexbox.dimValues[crossStart],
			storedVal = 0,
			containerSize;

		var prevItem;
		var prevMainStart = 0;
		var mainTotal = mainStart + "Total";

		var revValues = {
			"top": "bottom",
			"left": "right"
		};

		containerSize = container[mainSize];

		if (!isReverse) {
			incrementVal -= container.debug.border[mainStart];
			incrementVal -= container.debug.margin[mainStart];
		}

		var revStart = revValues[mainStart];

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];
			item[crossStart] = (storedVal + container.debug.padding[crossStart]);

			if (isReverse) {
				item[mainStart] = ((containerSize + container.debug.padding[mainStart]) - (item[mainSize] + item.debug.inner[mainStart]) - item.debug.margin[mainTotal]) - incrementVal;
			} else {
				item[mainStart] += incrementVal;
				item[mainStart] -= item.debug.margin[mainStart];

				if (isColumn) {
					if (prevItem) {
						prevMainStart += Math.min(item.debug.margin[mainStart], prevItem.debug.margin[revStart]);
						item[mainStart] += prevMainStart;
					}

					prevItem = item;
				}
			}

			if (needsIncrement) {
				incrementVal += item[mainSize] + item.debug.margin[mainTotal];

				if (isReverse) {
					incrementVal += item.debug.inner[mainStart];
				}
			}
		}

		// flex-direction sets which properties need updates
		// Expose these for use later.
		this.crossStart = crossStart;
		this.mainStart = mainStart;

		this.mainSize = mainSize;
		this.crossSize = crossSize;
	};
	
	Flexbox.models.flexWrap = function (wrap, properties) {
		var values = this.values;
		var itemValues = values.items;

		var i, j, k, l;

		var isWrap = (wrap === "wrap");
		var isWrapReverse = (wrap === "wrap-reverse");

		var crossStart = this.crossStart;
		var mainStart = this.mainStart;

		var mainSize = this.mainSize;
		var crossSize = this.crossSize;

		var container = values.container;
		var containerSize = container[mainSize];
		var lines = [];

		var line = {
			items: []
		};

		var utils = Flexbox.utils,
			colArray = ["column", "column-reverse"],
			revArray = ["row-reverse", "column-reverse"],
			flexDirection = properties["flex-direction"],
			isColumn = utils.assert(flexDirection, colArray),
			isReverse = utils.assert(flexDirection, revArray);

		var item;
		var items;
		var prevItem;

		var mainTotal = mainStart + "Total";
		var crossTotal = crossStart + "Total";

		var currMainStart = 0;
		var prevMainStart = 0;
		var currCrossStart = 0;
		var prevCrossStart = 0;

		var multiplier = isReverse ? -1 : 1;

		// TODO: Implement `flex-wrap: wrap-reverse;`
		if (isWrap || isWrapReverse) {
			var breakPoint = containerSize;

			var revValues = {
				"top": "bottom",
				"left": "right"
			};

			var revStart = revValues[mainStart];

			for (i = 0, j = itemValues.length; i < j; i++) {
				item = itemValues[i];

				if (currMainStart + (item[mainSize] + item.debug.inner[mainStart] + item.debug.margin[mainTotal]) > breakPoint) {
					lines.push(line);

					line = {
						items: []
					};

					prevMainStart += currMainStart;
					prevCrossStart += currCrossStart;

					if (isColumn && prevItem) {
						var newLineStart;

						if (isReverse) {
							newLineStart = ((item[mainStart] - container.debug.padding[mainStart]) + item[mainSize] + item.debug.inner[mainStart] + item.debug.margin[mainTotal]) - (prevMainStart * multiplier) - breakPoint;
						} else {
							newLineStart = (prevMainStart * multiplier) - (item[mainStart] - container.debug.padding[mainStart]);
						}

						if (newLineStart > 0) {
							prevMainStart -= newLineStart;
						}
					}

					currMainStart = 0;
					currCrossStart = 0;
				}

				item[mainStart] -= prevMainStart * multiplier;
				item[crossStart] += prevCrossStart;

				currMainStart += (item[mainSize] + item.debug.inner[mainStart]) + item.debug.margin[mainTotal];
				currCrossStart = Math.max(currCrossStart, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);

				if (isColumn) {
					if (prevItem) {
						currMainStart += Math.min(item.debug.margin[mainStart], prevItem.debug.margin[revStart]);
					}

					prevItem = item;
				}

				line.items.push(item);
			}
		} else {
			line.items = values.items;
		}

		lines.push(line);

		prevMainStart = 0;

		// Adjust positioning for padding
		if (!isColumn && !isReverse) {
			for (i = 0, j = lines.length; i < j; i++) {
				items = lines[i].items;

				for (k = 0, l = items.length; k < l; k++) {
					item = items[k];

					if (prevItem) {
						prevMainStart += prevItem.debug.inner[mainStart];
						item[mainStart] += prevMainStart;
					}

					prevItem = item;
				}
			}
		}

		// Expose lines
		this.lines = lines;
	};
	
	Flexbox.models.justifyContent = function (justification, properties) {
		var values = this.values,
			utils = Flexbox.utils,
			container = values.container,
			mainStart = this.mainStart,
			mainSize = this.mainSize,
			containerSize = container[mainSize],
			isStart = (justification === "flex-start"),
			isCenter = (justification === "center"),
			isBetween = (justification === "space-between"),
			isAround = (justification === "space-around"),
			revArray = ["row-reverse", "column-reverse"],
			isReverse = utils.assert(properties["flex-direction"], revArray),
			lines = this.lines,
			i, j, k, l, line, items, item,
			lineRemainder, multiplier = 1, x, y;

		isReverse = (isReverse) ? -1 : 1;

		var mainTotal = mainStart + "Total";

		if (isStart) {
			return;
		}

		for (i = 0, j = lines.length; i < j; i++) {
			x = 0;
			line = lines[i];
			items = line.items;
			l = items.length;
			multiplier = 1;

			lineRemainder = containerSize;

			for (k = 0; k < l; k++) {
				item = items[k];
				lineRemainder -= (item[mainSize] + item.debug.inner[mainStart]) + item.debug.margin[mainTotal];
			}

			if (isCenter || isAround && lineRemainder < 0) {
				multiplier = 0.5;
			}

			lineRemainder *= multiplier;

			k = 0;

			if (isBetween || isAround && lineRemainder >= 0) {
				k = 1;

				lineRemainder = Math.max(0, lineRemainder);
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

		var crossTotal = crossStart + "Total";
		var lineCrossSize;

		if (isStretch && isNotFlexWrap) {
			items = values.items;
			lineRemainder = values.container[crossSize] / lines.length;

			for (i = 0, j = lines.length; i < j; i++) {
				line = lines[i];
				items = line.items;
				l = items.length;

				for (k = 0; k < l; k++) {
					item = items[k];

					if (item.debug.auto[crossSize]) {
						if (i) {
							item[crossStart] += (lineRemainder - item[crossSize]) * i;
						}

						item[crossSize] = (lineRemainder - item.debug.inner[crossStart]) - item.debug.margin[crossTotal];
					}
				}
			}
		} else if (isStretch) {
			for (i = 0, j = lines.length; i < j; i++) {
				line = lines[i];
				items = line.items;
				l = items.length;

				lineCrossSize = 0;

				for (k = 0; k < l; k++) {
					item = items[k];

					if (item.debug.auto[crossSize]) {
						lineCrossSize = Math.max(lineCrossSize, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
					}
				}

				for (k = 0; k < l; k++) {
					item = items[k];

					if (item.debug.auto[crossSize]) {
						item[crossSize] = (lineCrossSize - item.debug.inner[crossStart]) - item.debug.margin[crossTotal];
					}
				}
			}
		}

		var remainderSize = containerSize;

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;

			for (k = 0; k < l; k++) {
				item = items[k];
				line.maxItemSize = Math.max(line.maxItemSize || 0, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
			}

			remainderSize -= line.maxItemSize;
		}

		remainderSize /= lines.length;

		if (isStretch || isStart || isBaseline) {
			return;
		}

		if (isCenter) {
			multiplier = 0.5;
			remainderSize *= 0.5;
		}

		if (!isNotFlexWrap && !isAlignContentStretch) {
			remainderSize = 0;
		}

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;
			lineRemainder = line.maxItemSize;

			for (k = 0; k < l; k++) {
				item = items[k];

				// Remove margin from crossStart
				item[crossStart] -= item.debug.margin[crossTotal] * multiplier;
				item[crossStart] += remainderSize + (lineRemainder - (item[crossSize] + item.debug.inner[crossStart])) * multiplier;
			}
		}
	};
	
	Flexbox.models.alignContent = function (alignment, properties) {
		var values = this.values,
			container = values.container,

			crossStart = this.crossStart,
			mainStart = this.mainStart,

			mainSize = this.mainSize,
			crossSize = this.crossSize,

			containerSize = container[crossSize],
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

		var alignItems = properties["align-items"];
		var isAlignItemsStretch = alignItems === "stretch";
		var crossTotal = crossStart + "Total";

		// http://www.w3.org/TR/css3-flexbox/#align-content-property
		//  Note, this property has no effect when the flexbox has only a single line.
		if (isNotFlexWrap && lines.length <= 1) {
			return;
		}

		if (isStart) {
			return;
		}

		lineRemainder = containerSize;

		for (i = 0, j = lines.length; i < j; i++) {
			x = 0;
			line = lines[i].items;

			for (k = 0, l = line.length; k < l; k++) {
				item = line[k];
				x = Math.max(x, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
			}

			lineRemainder -= x;
		}

		i = 0;
		x = 0;

		if ((isBetween || isAround) && lineRemainder <= 0) {
			if (isAround) {
				isAround = false;
				isCenter = true;
			} else {
				return;
			}
		}

		if (isCenter) {
			multiplier = 0.5;
		}

		if (isBetween || isAround || isStretch) {
			i = 1;

			lineRemainder /= (j - (!isBetween ? 0 : 1));
			x = lineRemainder;

			if (isAround) {
				y = (lineRemainder * 0.5);

				items = lines[0].items;

				for (k = 0, l = items.length; k < l; k++) {
					items[k][crossStart] += y;
				}

				lineRemainder += y;
			}
		}

		for (j = lines.length; i < j; i++) {
			item = lines[i].items;

			for (k = 0, l = item.length; k < l; k++) {
				item[k][crossStart] += (lineRemainder * multiplier);
			}

			lineRemainder += x;
		}

		if (isStretch && isAlignItemsStretch) {
			var prevCrossSize = container.debug.padding[crossStart];

			for (i = 0, j = lines.length; i < j; i++) {
				items = lines[i].items;

				var next = lines[i + 1];
				var lineCrossSize = containerSize + container.debug.padding[crossStart];

				if (next) {
					next = next.items[0];
					lineCrossSize = next[crossStart];
				}

				lineCrossSize -= prevCrossSize;

				for (k = 0, l = items.length; k < l; k++) {
					item = items[k];
					item[crossSize] = ((lineCrossSize - item.debug.inner[crossStart]) - item.debug.margin[crossTotal]);
				}

				prevCrossSize += lineCrossSize;
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
				order: models.order,
				flexDirection : models.flexDirection,
				flexWrap : models.flexWrap,
				justifyContent : models.justifyContent,
				alignItems : models.alignItems,
				alignSelf : models.alignSelf,
				alignContent : models.alignContent,
				flexGrow : models.flexGrow
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
	
	Flexie = function (settings) {
		this.settings = settings;
		return this.box(settings);
	};

	Flexie.prototype = {
		box : function (settings) {
			if (Flexbox.support === true) {
				return true;
			}

			var container = new Flexbox.container(settings);
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
