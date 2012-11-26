define([
	"jquery",
	"dist/reflexie",
	"lib/mocha",
	"lib/expect"
], function ($, Flexie) {
	"use strict";

	var DEBUG = false;
	var TESTS = {
		"children": {
			"x3": true,
			"x6": true
		},

		"direction": {
			"row": true,
			"row-reverse": true,
			"column": true,
			"column-reverse": true
		},

		"wrap": {
			"wrap": true,
			"nowrap": true,
			"wrap-reverse": true
		}
	};

	var hasSupport = (function () {
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

	var appendFlexChildren = function (target, children) {
		var i, j, idx,
			set = [], selector, element;

		target.empty();

		for (i = 0, j = children; i < j; i++) {
			idx = (i + 1);
			selector = "flex-col-" + idx;
			element = $('<div id="' + selector + '">Col ' + idx + '</div>');

			set.push({
				selector: "#" + selector,
				element: element[0]
			});

			target.append(element);
		}

		return set;
	};

	var logger = {
		log : function () {
			if (DEBUG) {
				console.log.apply(console, arguments);
			}
		},

		group : function (name) {
			if (DEBUG) {
				console.group(name);
			}
		},

		groupEnd : function (name) {
			if (DEBUG) {
				console.groupEnd(name);
			}
		}
	};

	return {
		handleDirection : function (json) {
			var flex = $("#flex-target");

			var sizeMap = {
				"row": "height",
				"row-reverse": "height",
				"column": "width",
				"column-reverse": "width"
			};

			var buildItemExpectancy = function (idx, key, value, isStretch) {
				var val = Math.floor(value);

				it(key + " should be " + val, function () {
					var childNodes = flex.children();
					var box = childNodes[idx].getBoundingClientRect();

					var range = (isStretch) ? 3 : 1;
					expect(Math.floor(box[key])).to.be.within(val - range,  val + range);
				});
			};

			var buildItemDescription = function (idx, item, isStretch) {
				describe(":nth-child(" + (idx + 1) + ")", function () {
					var childNodes = flex.children();
					var child = childNodes[idx];

					for (var key in item) {
						buildItemExpectancy(idx, key, item[key], isStretch);
					}
				});
			};

			var buildChildDescription = function (children, data, count) {
				describe(children, function () {
					var rules = data.rules;
					var isStretch = (rules["align-items"] === "stretch");
					isStretch = isStretch || (rules["align-content"] === "stretch");

					before(function () {
						flex.empty();

						var set = appendFlexChildren(flex, count);

						if (hasSupport) {
							flex.css("display", "-webkit-flex");
							flex.css(rules);
						}

						if (isStretch) {
							flex.children().addClass(sizeMap[rules["flex-direction"]]);
						}

						var flx = new Flexie({
							container: {
								"element": flex[0],
								"selector": "#flex-target",
								"properties": rules
							},

							items: set
						});
					});

					for (var i = 0, j = data.items.length; i < j; i++) {
						buildItemDescription(i, data.items[i], isStretch);
					}

					after(function () {
						var rules = data.rules;
						flex.children().removeClass(sizeMap[rules["flex-direction"]]);
					});
				});
			};

			var buildDirectionDescription = function (direction, data) {
				describe(direction, function () {
					var count = data.children;
					var x;

					if (TESTS.children["x" + count]) {
						for (var children in data) {
							x = data[children];

							if (x.items) {
								if (TESTS.wrap[x.rules["flex-wrap"]]) {
									buildChildDescription(children, data[children], count);
								}
							}
						}
					}
				});
			};

			for (var direction in json) {
				buildDirectionDescription(direction, json[direction]);
			}
		},

		buildFlexDescription : function (type, data) {
			describe("flex-direction: " + type, function () {
				this.handleDirection(data);
			}.bind(this));
		},

		handleJSON : function (json) {
			var deferred = $.Deferred();

			for (var type in json) {
				if (TESTS.direction[type]) {
					this.buildFlexDescription(type, json[type]);
				}
			}

			return deferred.resolve();
		},

		setup : function () {
			var deferred = $.Deferred();

			document.title = "Running Tests...";

			this.target = $("#flex-target");

			$.getJSON("data/flex.js?" + new Date().getTime())
				.then(function (json) {
					return this.handleJSON(json);
				}.bind(this))
			.then(function () {
				return deferred.resolve();
			});

			return deferred.promise();
		}
	};
});
