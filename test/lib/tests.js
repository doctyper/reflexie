define([
	"jquery",
	"dist/reflexie",
	"lib/mocha",
	"lib/expect"
], function ($, Flexie) {
	"use strict";

	var DEBUG = false;

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
		handleJSON : function (json) {
			var deferred = $.Deferred();

			var flex = $("#flex-target");

			var count = json.children;
			delete json.children;

			var set = appendFlexChildren(flex, count);
			var childNodes = flex.children();

			var sizeMap = {
				"row": "height",
				"row-reverse": "height",
				"column": "width",
				"column-reverse": "width"
			};

			var buildItemExpectancy = function (idx, key, value) {
				var val = Math.floor(value);

				it(key + " should be " + val, function () {
					var box = childNodes[idx].getBoundingClientRect();
					expect(Math.floor(box[key])).to.equal(val);
				});
			};

			var buildItemDescription = function (idx, item) {
				describe(":nth-child(" + (idx + 1) + ")", function () {
					var child = childNodes[idx];

					for (var key in item) {
						buildItemExpectancy(idx, key, item[key]);
					}
				});
			};

			var buildChildDescription = function (children, data) {
				describe(children, function () {
					before(function () {
						var rules = data.rules;
						var children = flex.children();

						// flex.css("display", "-webkit-flex");
						// flex.css(rules);

						var isStretch = (rules["align-items"] === "stretch");
						isStretch = isStretch || (rules["align-content"] === "stretch");

						if (isStretch) {
							children.css(sizeMap[rules["flex-direction"]], "auto");
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
						buildItemDescription(i, data.items[i]);
					}

					after(function () {
						flex.children().removeAttr("style");
					});
				});
			};

			describe("flex-direction: row, 3 child nodes", function () {
				for (var children in json) {
					buildChildDescription(children, json[children]);
				}
			});

			return deferred.resolve();
		},

		setup : function () {
			var deferred = $.Deferred();

			document.title = "Running Tests...";

			this.target = $("#flex-target");

			$.getJSON("data/flex-row-x3.js?" + new Date().getTime())
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
