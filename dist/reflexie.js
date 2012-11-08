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
 * Date: 11-7-2012
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
	
		JSONToStyles : function (selector, styles) {
			var rules = [selector + " {"];
			var value, isDimension;
	
			for (var key in styles) {
				value = styles[key];
				isDimension = this.testValue(key);
	
				if (isDimension && typeof value === "number") {
					value = value.toString() + "px";
				}
	
				rules.push(key + ": " + value + ";");
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
					break;
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
			primaryAxis = (isColumn ? "left" : "top"),
			secondaryAxis = (isColumn ? "top" : "left"),
			primaryDimension = Flexbox.dimValues[secondaryAxis],
			secondaryDimension = Flexbox.dimValues[primaryAxis],
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
	};
	
	Flexbox.models.flexWrap = function (wrap, properties) {
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
	};
	
	
	
	
	Flexbox.container = (function () {
		var utils = Flexbox.utils;
		var models = Flexbox.models;
	
		Flexbox.dimValues = {
			"left": "width",
			"top": "height"
		};
	
		Flexbox.applyPositioning = function (id, container, items, values) {
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
	
		Flexbox.getPristineBox = function (element, position) {
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
	
		Flexbox.storePositionValues = function (container, items) {
			var i, j;
			var box = Flexbox.getPristineBox(container.element, "relative");
			var children = [];
	
			for (i = 0, j = items.length; i < j; i++) {
				children.push(Flexbox.getPristineBox(items[i].element));
			}
	
			return {
				container: box,
				items: children
			};
		};
	
		Flexbox.clonePositionValues = function (values) {
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
				this.dom.values = Flexbox.storePositionValues(this.container, this.items);
				this.values = Flexbox.clonePositionValues(this.dom.values);
	
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
	
				Flexbox.applyPositioning(this.uid, this.container, this.items, this.values);
			}
		};
	
		return Container;
	
	}());
	
	Flexbox.container = (function () {
		var utils = Flexbox.utils;
		var models = Flexbox.models;
	
		Flexbox.dimValues = {
			"left": "width",
			"top": "height"
		};
	
		Flexbox.applyPositioning = function (id, container, items, values) {
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
	
		Flexbox.getPristineBox = function (element, position) {
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
	
		Flexbox.storePositionValues = function (container, items) {
			var i, j;
			var box = Flexbox.getPristineBox(container.element, "relative");
			var children = [];
	
			for (i = 0, j = items.length; i < j; i++) {
				children.push(Flexbox.getPristineBox(items[i].element));
			}
	
			return {
				container: box,
				items: children
			};
		};
	
		Flexbox.clonePositionValues = function (values) {
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
				this.dom.values = Flexbox.storePositionValues(this.container, this.items);
				this.values = Flexbox.clonePositionValues(this.dom.values);
	
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
	
				Flexbox.applyPositioning(this.uid, this.container, this.items, this.values);
			}
		};
	
		return Container;
	
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
