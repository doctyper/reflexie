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
 * Date: 3-22-2013
 */
(function (window, undefined) {

	"use strict";

	/*!
	Copyright 2012 Adobe Systems Inc.;
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
	*/

	// Various shims for missing functionality in older browsers
	!function() {
		if (typeof String.prototype.trim !== "function") {

			String.prototype.trim = function(string) {
				return string.replace(/^\s+/,"").replace(/\s+$/,"");
			}
		}

		if (typeof Array.prototype.forEach !== 'function') {

			Array.prototype.forEach = function(iterator, thisArg) {
				if (typeof iterator !== 'function') {
					throw new TypeError("Invalid parameter. Expected 'function', got " + typeof iterator)
				}

				var self = Object(this),
					len = self.length,
					i = 0;

				for (i; i < len; i++) {
					// call the iterator function within the requested context with the current value, index and source array
					iterator.call(thisArg, this[i], i, self)
				}
			}
		}

		if (typeof Array.prototype.indexOf !== 'function') {

			Array.prototype.indexOf = function(value) {
				var self = Object(this),
					matchedIndex = -1;

				self.forEach(function(item, index) {
					if (item === value) {
						matchedIndex = index
						return
					}
				})

				return matchedIndex
			}
		}
	}()
	/*!
	Copyright 2012 Adobe Systems Inc.;
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
	*/

	!(function(scope){

		function getStyleSheetElements() {
			var doc = document,
				stylesheets = [];

			if (typeof doc.querySelectorAll == 'function') {
				// shiny new browsers
				stylesheets = doc.querySelectorAll('link[rel="stylesheet"], style');

				// make it an array
				stylesheets = Array.prototype.slice.call(stylesheets, 0);
			} else {
				// old and busted browsers
				var tags = doc.getElementsByTagName("link");

				if (tags.length) {
					for (var i = 0, len = tags.length; i < len; i++) {
						if (tags[i].getAttribute('rel') === "stylesheet") {
							stylesheets.push(tags[i]);
						}
					}
				}
			}

			return stylesheets;
		}

		function StyleSheet(source){
			this.source = source;
			this.url = source.href || null;
			this.cssText = '';
		}

		StyleSheet.prototype.load = function(onSuccess, onError, scope) {
			var self = this;

			// Loading external stylesheet
			if (this.url) {
				var xhr = new XMLHttpRequest();

				xhr.onreadystatechange = function() {
					if(xhr.readyState === 4) {
						if (xhr.status === 200) {
							self.cssText = xhr.responseText;
							onSuccess.call(scope, self);
						} else{
							onError.call(scope, self);
						}
					}
				}

				// forced sync to keep Regions CSSOM working sync
				xhr.open('GET', this.url, false);
				xhr.send(null);
			} else {
				this.cssText = this.source.textContent;
				onSuccess.call(scope, self);
			}
		};

		function StyleLoader(callback) {
			if (!(this instanceof StyleLoader)) {
				return new StyleLoader(callback);
			}

			this.stylesheets = [];
			this.queueCount = 0;
			this.callback = callback || function(){};

			this.init();
		}

		StyleLoader.prototype.init = function() {
			var els = getStyleSheetElements(),
				len = els.length,
				stylesheet,
				i;

			this.queueCount = len;

			for ( i = 0; i < len; i++) {
				stylesheet = new StyleSheet(els[i]);
				this.stylesheets.push(stylesheet);
				stylesheet.load(this.onStyleSheetLoad, this.onStyleSheetError, this);
			}
		}

		StyleLoader.prototype.onStyleSheetLoad = function(stylesheet) {
			this.queueCount--;
			this.onComplete.call(this);
		}

		StyleLoader.prototype.onStyleSheetError = function(stylesheet) {
			var len = this.stylesheets.length,
				i;

			for ( i = 0; i < len; i++) {
				if (stylesheet.source === this.stylesheets[i].source) {
					// remove the faulty stylesheet
					this.stylesheets.splice(i, 1);

					this.queueCount--;
					this.onComplete.call(this);
					return;
				}
			}
		}

		StyleLoader.prototype.onComplete = function() {
			if (this.queueCount === 0) {
				// run the callback after all stylesheet contents have loaded
				this.callback.call(this, this.stylesheets);
			}
		}

		scope["StyleLoader"] = StyleLoader;
	})(window);
	/*!
	Copyright 2012 Adobe Systems Inc.;
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
	*/

	/*
	Real developers learn from source. Welcome!

	Light JavaScript CSS Parser
	Author: Razvan Caliman (rcaliman@adobe.com, twitter: @razvancaliman)

	This is a lightweight, naive and blind CSS Parser. It's meant to be used as a
	building-block for experiments with unsupported CSS rules and properties.

	This experimental parser is not intended to fully comply with any CSS Standard.
	Use it responsibly and have fun! ;)
	*/
	!function(scope) {

		function CSSRule() {
			this.selectorText = null;
			this.style = {};
			this.type = "rule";
		}

		CSSRule.prototype = {

			 setSelector: function(string) {
				this.selectorText = string;

				// detect @-rules in the following format: @rule-name identifier{ }
				var ruleType = string.match(/^@([^\s]+)\s*([^{]+)?/);

				if (ruleType && ruleType[1]) {
					switch (ruleType[1]){
						case "template":
							this.type = "template";
							this.cssRules = [];
						break

						case "slot":
							this.type = "slot";
						break

						default:
							this.type = "unknown";
					}

					// set the identifier of the rule
					this.identifier = ruleType[2] || "auto";
				}
			},

			setStyle: function(properties) {

				if (!properties){
					throw new TypeError("CSSRule.setStyles(). Invalid input. Expected 'object', got " + properties);
				}

				this.style = properties || {};

				return this.style;
			},

			setParentRule: function(rule) {

				if (!rule){
					throw new TypeError("CSSRule.setParentRule(). Invalid input. Expected 'object', got " + properties);
				}

				this.parentRule = rule;

				return this.parentRule;
			}
		}

		/*
			Naive and blind CSS syntax parser.

			The constructor returns a CSSParser object with the following members:
				.parse(string) - method to parse a CSS String into an array of CSSRule objects

				.clear() - method to remove any previously parsed data
				.cssRules - array with CSSRule objects extracted from the parser input string
		*/
		function CSSParser() {

			/*

				Extracts the selector-like part of a string.

				Matches anything after the last semicolon ";". If no semicolon is found, the input string is returned.

				This is an optimistic matching. No selector validation is perfomed.

				@param {String} string The string where to match a selector

				@return {String} The selelector-like string
			*/
			function getSelector(string) {
				var sets = string.trim().split(";");

				if (sets.length) {
					return sets.pop().trim();
				}

				return null;
			}

			/*
				Parse a string and return an object with CSS-looking property sets.

				Matches all key/value pairs separated by ":",

				themselves separated between eachother by semicolons ";"

				This is an optimistic matching. No key/valye validation is perfomed other than 'undefined'.

				@param {String} string The CSS string where to match property pairs
				@return {Obect} The object with key/value pairs that look like CSS properties
			*/
			function parseCSSProperties(string) {
				 var properties = {},
					 sets = string.trim().split(";");

				 if (!sets || !sets.length) {
					 return properties;
				 }

				 sets.forEach(function(set) {

					 // invalid key/valye pair
					 if (set.indexOf(":") == -1){

						 return;
					 }

					 var key,

						 value,
						 parts = set.split(":");

					 if (parts[0] !== undefined && parts[1] !== undefined) {
						 key = parts[0].trim();
						 value = parts[1].trim().replace(/[\"\']/g, "");

						 properties[key] = value;
					 }
				 })

				 return properties;
			 }

			 /*
				Parse a string and create CSSRule objects from constructs looking like CSS rules with valid grammar.

				CSSRule objects are added to the 'cssRules' Array of the CSSParser object.

				This is an optimistic matching. Minor syntax validation is used.

				Supports nested rules.

				Example:

				@template{

					@slot{

					}
				}

			 */
			 function parseBlocks(string, set, parent) {
				 var start = string.indexOf("{"),
					properties,

					rule = new CSSRule,
					token = string.substring(0, start),
					selector = getSelector(token),
					remainder = string.substr(start + 1, string.length),
					end = remainder.indexOf("}"),
					nextStart = remainder.indexOf("{");

				 if (start > 0) {

					 rule.setSelector(selector);

					 if (parent) {
						 rule.setParentRule(parent);

						/*
							If it's a nested structure (a parent exists) properties might be mixed in with nested rules.
							Make sure the parent gets both its styles and nested rules

							Example:
							@template{

								background: green;

								@slot{

								}

							}
						*/

						properties = parseCSSProperties(token);

						parent.setStyle(properties);
					 }

					  // nested blocks! the next "{" occurs before the next "}"
					 if (nextStart > -1 && nextStart < end) {

						 // find where the block ends
						 end = getBalancingBracketIndex(remainder, 1);

						 // extract the nested block cssText
						 var block = remainder.substring(0, end);

						 properties = parseCSSProperties(token);

						 rule.setStyle(properties);
						 rule.cssRules = rule.cssRules || [];

						 // parse the rules of this block, and assign them to this block's rule object
						 parseBlocks(block, rule.cssRules, rule);

						 // get unparsed remainder of the CSS string, without the block
						 remainder = remainder.substring(end + 1, remainder.length);
					 } else {
						 properties = parseCSSProperties(remainder.substring(0, end));

						 rule.setStyle(properties);

						 // get the unparsed remainder of the CSS string
						 remainder = remainder.substring(end + 1, string.length);
					 }

					 // continue parsing the remainder of the CSS string
					 parseBlocks(remainder, set);

					 // prepend this CSSRule to the cssRules array
					 set.unshift(rule);

				 }

				 function getBalancingBracketIndex(string, depth) {
					var index = 0;

					while(depth){

						switch (string.charAt(index)){
							case "{":

								depth++;
								break;
							case "}":
								 depth--;
								break;
						}

						index++;
					}

					return (index - 1);
				 }
			 }

			function cascadeRules(rules) {
				if (!rules) {
					throw new Error("CSSParser.cascadeRules(). No css rules available for cascade");
				}

				if (!rules.length) {
					return rules;
				}

				var cascaded = [],
					temp = {},
					selectors = [];

				rules.forEach(function(rule) {

					if (rule.cssRules){
						rule.cssRules = cascadeRules(rule.cssRules);
					}

					// isDuplicate
					if (!temp[rule.selectorText]) {

						// store this selector in the order that was matched
						// we'll use this to sort rules after the cascade
						selectors.push(rule.selectorText);

						// create the reference for cascading into
						temp[rule.selectorText] = rule;
					} else {
						// cascade rules into the matching selector
						temp[rule.selectorText] = extend({}, temp[rule.selectorText], rule);
					}
				});

				// expose cascaded rules in the order the parser got them
				selectors.forEach(function(selectorText) {
					cascaded.push(temp[selectorText]);
				}, this);

				// cleanup
				temp = null;
				selectors = null;

				return cascaded;
			}

			function extend(target) {
				var sources = Array.prototype.slice.call(arguments, 1);
				sources.forEach(function(source) {
					for (var key in source) {

						// prevent an infinite loop trying to merge parent rules
						// TODO: grow a brain and do this more elegantly
						if (key === "parentRule") {
							return;
						}

						// is the property pointing to an object that's not falsy?
						if (typeof target[key] === 'object' && target[key]) {
							 // dealing with an array?
							 if (typeof target[key].slice === "function") {
								 target[key] = cascadeRules(target[key].concat(source[key]));
							 } else {
							 // dealing with an object
								 target[key] = extend({}, target[key], source[key]);
							 }
						} else {
							target[key] = source[key];
						}
					}
				});

				return target;
			}

			return {
				cssRules: [],

				parse: function(string) {
					 // inline css text and remove comments
					string = string.replace(/[\n\t]+/g, "").replace(/\/\*[\s\S]*?\*\//g,'').trim();
					parseBlocks.call(this, string, this.cssRules);
				},

				/*
					Parse a single css block declaration and return a CSSRule.

					@return {CSSRule} if valid css declaration
					@return {null} if invalid css declaration

				*/
				parseCSSDeclaration: function(string) {
					var set = [];
					parseBlocks.call(this, string, set);
					if (set.length && set.length === 1) {
						return set.pop();
					} else {
						return null;
					}
				},

				clear: function() {
					this.cssRules = [];
				},

				cascade: function(rules) {
					if (!rules || !rules.length) {
						// TODO: externalize this rule
						this.cssRules = cascadeRules.call(this, this.cssRules);
						return;
					}

					return cascadeRules.call(this, rules);
				},

				doExtend: extend
			}
		}

		scope = scope || window;
		scope["CSSParser"] = CSSParser;

	}(window);
	/*!
	  * domready (c) Dustin Diaz 2012 - License MIT
	  */
	var domReady = (function (ready) {

	  var fns = [], fn, f = false
		, doc = document
		, testEl = doc.documentElement
		, hack = testEl.doScroll
		, domContentLoaded = 'DOMContentLoaded'
		, addEventListener = 'addEventListener'
		, onreadystatechange = 'onreadystatechange'
		, readyState = 'readyState'
		, loaded = /^loade|c/.test(doc[readyState])

	  function flush(f) {
		loaded = 1
		while (f = fns.shift()) f()
	  }

	  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
		doc.removeEventListener(domContentLoaded, fn, f)
		flush()
	  }, f)

	  hack && doc.attachEvent(onreadystatechange, fn = function () {
		if (/^c/.test(doc[readyState])) {
		  doc.detachEvent(onreadystatechange, fn)
		  flush()
		}
	  })

	  return (ready = hack ?
		function (fn) {
		  self != top ?
			loaded ? fn() : fns.push(fn) :
			function () {
			  try {
				testEl.doScroll('left')
			  } catch (e) {
				return setTimeout(function() { ready(fn) }, 50)
			  }
			  fn()
			}()
		} :
		function (fn) {
		  loaded ? fn() : fns.push(fn)
		})
	}());
	/**
	 * Calculates the specificity of CSS selectors
	 * http://www.w3.org/TR/css3-selectors/#specificity
	 *
	 * Returns an array of objects with the following properties:
	 *  - selector: the input
	 *  - specificity: e.g. 0,1,0,0
	 *  - parts: array with details about each part of the selector that counts towards the specificity
	 */
	var SPECIFICITY = (function() {
		var calculate,
			calculateSingle;

		calculate = function(input) {
			var selectors,
				selector,
				i,
				len,
				results = [];

			// Separate input by commas
			selectors = input.split(',');

			for (i = 0, len = selectors.length; i < len; i += 1) {
				selector = selectors[i];
				if (selector.length > 0) {
					results.push(calculateSingle(selector));
				}
			}

			return results;
		};

		// Calculate the specificity for a selector by dividing it into simple selectors and counting them
		calculateSingle = function(input) {
			var selector = input,
				findMatch,
				typeCount = {
					'a': 0,
					'b': 0,
					'c': 0
				},
				parts = [],
				// The following regular expressions assume that selectors matching the preceding regular expressions have been removed
				attributeRegex = /(\[[^\]]+\])/g,
				idRegex = /(#[^\s\+>~\.\[:]+)/g,
				classRegex = /(\.[^\s\+>~\.\[:]+)/g,
				pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/g,
				pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g,
				elementRegex = /([^\s\+>~\.\[:]+)/g;

			// Find matches for a regular expression in a string and push their details to parts
			// Type is "a" for IDs, "b" for classes, attributes and pseudo-classes and "c" for elements and pseudo-elements
			findMatch = function(regex, type) {
				var matches, i, len, match, index, length;
				if (regex.test(selector)) {
					matches = selector.match(regex);
					for (i = 0, len = matches.length; i < len; i += 1) {
						typeCount[type] += 1;
						match = matches[i];
						index = selector.indexOf(match);
						length = match.length;
						parts.push({
							selector: match,
							type: type,
							index: index,
							length: length
						});
						// Replace this simple selector with whitespace so it won't be counted in further simple selectors
						selector = selector.replace(match, Array(length + 1).join(' '));
					}
				}
			};

			// Remove the negation psuedo-class (:not) but leave its argument because specificity is calculated on its argument
			(function() {
				var regex = /:not\(([^\)]*)\)/g;
				if (regex.test(selector)) {
					selector = selector.replace(regex, '	 $1 ');
				}
			}());

			// Remove anything after a left brace in case a user has pasted in a rule, not just a selector
			(function() {
				var regex = /{[^]*/gm,
					matches, i, len, match;
				if (regex.test(selector)) {
					matches = selector.match(regex);
					for (i = 0, len = matches.length; i < len; i += 1) {
						match = matches[i];
						selector = selector.replace(match, Array(match.length + 1).join(' '));
					}
				}
			}());

			// Add attribute selectors to parts collection (type b)
			findMatch(attributeRegex, 'b');

			// Add ID selectors to parts collection (type a)
			findMatch(idRegex, 'a');

			// Add class selectors to parts collection (type b)
			findMatch(classRegex, 'b');

			// Add pseudo-element selectors to parts collection (type c)
			findMatch(pseudoElementRegex, 'c');

			// Add pseudo-class selectors to parts collection (type b)
			findMatch(pseudoClassRegex, 'b');

			// Remove universal selector and separator characters
			selector = selector.replace(/[\*\s\+>~]/g, ' ');

			// Remove any stray dots or hashes which aren't attached to words
			// These may be present if the user is live-editing this selector
			selector = selector.replace(/[#\.]/g, ' ');

			// The only things left should be element selectors (type c)
			findMatch(elementRegex, 'c');

			// Order the parts in the order they appear in the original selector
			// This is neater for external apps to deal with
			parts.sort(function(a, b) {
				return a.index - b.index;
			});

			return {
				selector: input,
				specificity: '0,' + typeCount.a.toString() + ',' + typeCount.b.toString() + ',' + typeCount.c.toString(),
				parts: parts
			};
		};

		return {
			calculate: calculate
		};
	}());

	// Export for Node JS
	if (typeof exports !== 'undefined') {
		exports.calculate = SPECIFICITY.calculate;
	}
	

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
	
	Flexbox.parser = {
		properties : {
			container : {
				"display": ["flex", "inline-flex"],
				"flex-direction": true,
				"flex-wrap": true,
				"justify-content": true,
				"align-items": true,
				"align-content": true
			},

			items : {
				"order": true,
				"flex-grow": true,
				"flex-shrink": true,
				"flex-basis": true,
				"align-self": true
			}
		},

		onStylesLoaded : function (stylesheets) {
			var parser = new CSSParser(),
				i, j, sheet, relationships, flex;

			for (i = 0, j = stylesheets.length; i < j; i++) {
				sheet = stylesheets[i];

				// Parse the stylesheet for rules
				parser.parse(sheet.cssText);
			}

			if (parser.cssRules.length === 0) {
				return;
			}

			relationships = this.filterFlexRules(parser.cssRules);

			// All done. Pass the new relationships to Flexie
			for (i = 0, j = relationships.length; i < j; i++) {
				flex = new Flexie(relationships[i]);
			}
		},

		validateRules : function (valid, rules) {
			var map, rule, prop,
				i, j;

			for (rule in rules) {
				prop = valid[rule];

				if (prop) {
					map = map || {};

					if (prop.length && prop !== true) {
						for (i = 0, j = prop.length; i < j; i++) {
							if (rules[rule] === prop[i]) {
								map[rule] = rules[rule];
								break;
							}
						}
					} else {
						map[rule] = rules[rule];
					}
				}
			}

			return map;
		},

		validateContainer : function (styles) {
			return this.validateRules(this.properties.container, styles);
		},

		validateItems : function (styles) {
			return this.validateRules(this.properties.items, styles);
		},

		sortByDescendingSpecificity : function (a, b) {
			// SPECIFICITY requires a string of comma-delimited selectors
			// Kind of a kludge, but...
			var aSpec = parseFloat(a.specificity.split(",").join(""));
			var bSpec = parseFloat(b.specificity.split(",").join(""));

			// Return in descending order of specificity.
			return bSpec - aSpec;
		},

		checkMatchingSelectors : function (map) {
			var specificityMap = {}, matchesMap = {},
				matchesSelector = Flexbox.utils.matchesSelector,
				selector, elements, current,
				key, sibling, specificity, combinedMap,
				keys = Flexbox.utils.keys(map), dominant,
				i, j, k, l;

			// Start a while loop using keys as the driver.
			selector = keys.shift();

			while (selector) {

				// Create a unique key value pair for each matching selector
				matchesMap[selector] = matchesMap[selector] || [selector];

				// Poll the DOM for use with matchesSelector
				elements = document.querySelectorAll(selector);

				// Iterate through our result set
				for (i = 0, j = elements.length; i < j; i++) {
					current = elements[i];

					// Test against sibling keys
					for (k = 0, l = keys.length; k < l; k++) {
						sibling = keys[k];

						// Don't match against itself
						if (sibling !== selector) {
							var match = matchesSelector(current, sibling);

							// If true, we have a duplicate match
							// Gather matches into array for later merging
							if (match === true) {
								matchesMap[selector] = matchesMap[selector].concat(keys.splice(k, 1));

								// We've modified the current array
								// So let's adjust count values
								k = (k - 1);
								l = keys.length;
							}
						}
					}
				}

				// Continue while keys remain in array
				selector = keys.shift();
			}

			// Now we have a key value map of related selectors
			// We need to organize and join values based on specificity
			//
			// Just like a real CSS engine. Fun!
			for (key in matchesMap) {

				// Use https://github.com/keeganstreet/specificity
				// Calculate a selector's given specificity
				specificity = SPECIFICITY.calculate(matchesMap[key].join());

				// Now sort by descending specificity values
				specificity.sort(this.sortByDescendingSpecificity);

				// Create a shell for our combined object
				combinedMap = {};

				// Loop through our sorted specificity values
				for (i = 0, j = specificity.length; i < j; i++) {
					current = map[specificity[i].selector];

					// At long last, combine values
					for (selector in current) {

						// Remember, we sorted by descending specificity
						// So if value exists in map, discard it. It's too weak to apply.
						combinedMap[selector] = combinedMap[selector] || current[selector];
					}
				}

				// Our dominant selector is the first in the array.
				dominant = specificity.shift();

				// So we name the key after it, and assign it the combined object.
				specificityMap[dominant.selector] = combinedMap;
			}

			// Done.
			return specificityMap;
		},

		filterDuplicates : function (objects) {
			var i, j, obj;
			var map = {};

			for (i = 0, j = objects.length; i < j; i++) {
				obj = objects[i];

				// Just like the DOM, we take everything the style sheet gives us
				// and apply it to our element. Cascade away.
				map[obj.selectorText] = map[obj.selectorText] || {};

				for (var key in obj.style) {
					map[obj.selectorText][key] = obj.style[key];
				}
			}

			// Now that we have unique selectors,
			// check that the selectors do not match each other,
			// or solve if they do match each other
			map = this.checkMatchingSelectors(map);

			return map;
		},

		buildSelector : function (container, item, index) {
			var parts = [container, " > "],
				classes, i, j, attribute, nth;

			// First start with the element name
			parts.push(item.nodeName.toLowerCase());

			// Add an ID if present
			if (item.id) {
				parts.push("#" + item.id);
			}

			// Add classes if present
			if (item.className) {
				classes = item.className.trim().split(" ");

				for (i = 0, j = classes.length; i < j; i++) {
					parts.push("." + classes[i]);
				}
			}

			if (item.attributes.length) {
				for (i = 0; i < item.attributes.length; i++) {
					attribute = item.attributes[i];

					if (attribute.specified) {
						switch (attribute.name) {
						case "class":
						case "id":
							break;

						default:
							parts.push("[" + attribute.name + "=" + attribute.value + "]");
							break;
						}
					}
				}
			}

			// If parts length is 3, there aren't any identifiers strong enough
			// So let's improvise
			if (parts.length === 3) {
				var supportsNth = Flexbox.utils.nthChildSupport();

				if (supportsNth) {
					parts.push(":nth-child(" + (index + 1) + ")");
				} else {
					nth = "nth-child-" + (index + 1);
					item.className += " " + nth;
					parts.push("." + nth);
				}
			}

			return parts.join("");
		},

		mapChildren : function (container, selector, items) {
			var matchesSelector = Flexbox.utils.matchesSelector,
				children = container.childNodes,
				i, j, item, child, match, x = 0,
				related = [];

			for (i = 0, j = children.length; i < j; i++) {
				child = children[i];

				if (child.nodeType === 1) {
					match = false;

					for (item in items) {
						if (matchesSelector(child, item)) {
							related.push({
								element: child,
								selector: item,
								properties: items[item]
							});

							match = true;
							break;
						}
					}

					if (!match) {
						related.push({
							element: child,
							selector: this.buildSelector(selector, child, x),
							properties: {}
						});
					}

					x++;
				}
			}

			return related;
		},

		gatherRelationships : function (containers, items) {
			var relationships = [];

			// First start by grouping known duplicates
			// i.e. containers & items with the same selectorText
			containers = this.filterDuplicates(containers);
			items = this.filterDuplicates(items);

			var container, children, selector,
				containerElements, containerElement,
				i, j, itemElement;

			for (selector in containers) {
				container = containers[selector];
				containerElements = document.querySelectorAll(selector);

				for (i = 0, j = containerElements.length; i < j; i++) {
					containerElement = containerElements[i];

					if (containerElement) {
						children = this.mapChildren(containerElement, selector, items);

						relationships.push({
							container: {
								element: containerElement,
								selector: selector,
								properties: container
							},

							items: children
						});
					}
				}
			}

			return relationships;
		},

		filterFlexRules : function (rules) {
			var i, j, group, styles,
				isContainer, isItem;

			var containers = [];
			var items = [];

			for (i = 0, j = rules.length; i < j; i++) {
				group = rules[i];
				styles = group.style;

				isContainer = this.validateContainer(styles);

				if (isContainer) {
					group.style = isContainer;
					containers.push(group);
				}

				isItem = this.validateItems(styles);

				if (isItem) {
					group.style = isItem;
					items.push(group);
				}
			}

			return this.gatherRelationships(containers, items);
		}
	};
	
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
			lineRemainder, multiplier = 1, x, y;

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
								map["flex-grow"] = val;
							} else {
								switch (val) {
								case "initial":
									break;

								case "auto":
									map["flex-grow"] = 1;
									break;

								case "none":
									map["flex-shrink"] = 0;
									break;

								default:
									// Assume value is a width value, map to flex-basis
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
				this.uid = this.generateUID(settings.container);

				// Clean DOM, remove pre-existing styles
				utils.removeStyles(this.uid);

				this.container = settings.container;
				this.items = settings.items;

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
	
	Flexie.init = function () {
		// Load all stylesheets then feed them to the parser
		return new StyleLoader((function () {
			return function (stylesheets) {
				Flexbox.parser.onStylesLoaded(stylesheets);
			};
		}()));
	};

	domReady(function () {
		// Check for native Flexbox support
		if (Flexbox.support === true) {
			return true;
		}

		// Does not support flexbox.
		// But does it support other stuff we depend on?
		if (!("querySelectorAll" in document)) {
			throw new Error("Flexie needs `document.querySelectorAll`, but your browser doesn't support it.");
		}

		// no native Flexbox support, use polyfill
		Flexie.init();
	});
	
	// Uses AMD or browser globals to create a module.
	if (typeof define === "function" && define.amd) {
		define(function () {
			return Flexie;
		});
	} else {
		window.Flexie = Flexie;
	}
	
})(window);
