define([
	"jquery",
	"dist/reflexie",
	"lib/text",
	"lib/mocha",
	"lib/expect"
], function ($, Flexie, text) {
	"use strict";

	var DEBUG = true;

	// Setup Flexie
	Flexie.init();

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

	var appendFlexChildren = function (target, items, children) {
		var i, j, idx,
			set = [], selector, element;

		target.empty();

		for (i = 0, j = children; i < j; i++) {
			idx = (i + 1);
			selector = "flex-col-" + idx;
			element = $('<div id="' + selector + '">' + text[i] + '</div>');

			set.push({
				selector: "#" + selector,
				element: element[0],
				properties: items[i]
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

	var prettifyDescription = function (selector, rules) {
		var string = selector + " { ";

		for (var key in rules) {
			string += key + ": " + rules[key] + "; ";
		}

		string += "}";

		return string;
	};

	var buildFlexDescription = function (type, data) {
		type = type.replace(/\@start/g, "[").replace(/\@end/g, "]");

		var desc = JSON.parse(type);
		var flex = $("#flex-target");

		// TODO: Get rid of this kludgy mess
		if (desc.parent["align-items"] === "baseline") {
			return;
		}
		// TODO: Get rid of this kludgy mess

		var children = flex.children();

		describe(prettifyDescription("#flex-target", desc.parent), function () {

			before(function (done) {
				$("style[data-flexie]").remove();

				flex = $("#flex-target");
				flex.empty().removeAttr("style");

				var set = appendFlexChildren(flex, desc.items, data.items.length);
				children = flex.children();

				var i, j, mainSize, crossSize, sizeValue;

				if (hasSupport) {
					var prefixes = "webkit moz ms o".split(" ");

					for (i = 0, j = prefixes.length; i < j; i++) {
						flex.css("display", "-" + prefixes[i] + "-" + desc.parent.display);
					}

					delete desc.parent.display;
				}

				if (hasSupport) {
					flex.css(desc.parent);

					for (i = 0, j = children.length; i < j; i++) {
						$(children[i]).css(desc.items[i]);
					}
				} else {
					if (desc.parent.width) {
						flex.addClass("width");
						delete desc.parent.width;
					}

					if (desc.parent.height) {
						flex.addClass("height");
						delete desc.parent.height;
					}

					for (i = 0, j = children.length; i < j; i++) {
						var item = desc.items[i],
							child = $(children[i]);

						if (item.width) {
							child.addClass("width");
							delete item.width;
						}

						if (item.height) {
							child.addClass("height");
							delete item.height;
						}

						if (item.overflow) {
							child.addClass(item.overflow);
							delete item.overflow;
						}
					}
				}

				var flx = new Flexie({
					container: {
						"element": flex[0],
						"selector": "#flex-target",
						"properties": desc.parent
					},

					items: set
				});

				if ($.browser.msie) {
					// Bug in Internet Explorer throws stack overflows unless we throttle each test
					setTimeout(done, 0);
				} else {
					done();
				}
			});

			var setupItemTests = function (prop, val, index) {
				it(prop + " should be " + val, function () {

					var child = $("#flex-target").children().get(index);
					var box = child.getBoundingClientRect();
					// var range = (isStretch) ? 4 : 2;
					var range = 3;

					expect(Math.floor(box[prop])).to.be.within(val - range,  val + range);
				});
			};

			var setupItemDescriptions = function (item, index) {
				describe(prettifyDescription("#flex-col-" + (index + 1), desc.items[index]), function () {
					for (var prop in item) {
						setupItemTests(prop, parseFloat(item[prop]), index);
					}
				});
			};

			for (var i = 0, j = data.items.length; i < j; i++) {
				var item = data.items[i];

				if (desc.items[i]["align-self"] === "baseline") {
					continue;
				}

				setupItemDescriptions(item, i);
			}

			after(function () {
				flex.removeClass();
				children.removeClass();
			});
		});
	};

	var handleJSON = function (json) {
		var deferred = $.Deferred();

		for (var type in json) {
			buildFlexDescription(type, json[type]);
		}

		return deferred.resolve();
	};

	return {
		setup : function () {
			var deferred = $.Deferred();

			document.title = "Running Tests...";

			var target = $("#flex-target");

			$.getJSON("data/flex.js?" + new Date().getTime())
				.then(function (json) {
					return handleJSON(json);
				})
			.then(function () {
				return deferred.resolve();
			});

			return deferred.promise();
		}
	};
});
