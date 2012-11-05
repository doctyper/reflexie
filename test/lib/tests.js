define([
	"jquery",
	"reflexie/reflexie",
	"lib/mocha",
	"lib/expect"
], function ($, Flexbox) {
	"use strict";

	var buildTest = function (el, rect, val) {
		it(rect + " should be " + val, function () {
			var box = el.getBoundingClientRect();
			expect(box[rect]).to.equal(val);
			console.log("expect", box[rect], "to equal", val);
		});
	};

	return {
		run : function () {
			var deferred = $.Deferred();

			var target = $("#flex-target");
			var flexProp = ($.browser.chrome ? "-webkit-" : "") + "flex";

			var children = target.children();
			document.title = "Running Tests...";

			$.getJSON("data/flex.js", function (json) {
				var property, values, value,
					types, container, items,
					rect, i, j, child;

				for (property in json) {
					describe(property, function () {
						var p = property;
						values = json[property];

						before(function () {
							console.group(p);
						});

						for (value in values) {

							describe(value, function () {
								var v = value;

								before(function () {
									target.removeAttr("style");
									children.removeAttr("style");

									var styles = {};
									styles["display"] = flexProp;
									styles[p] = v;

									target.css(styles);

									var flex = new Flexbox({
										container: {
											"element": target[0],
											"properties": styles
										},

										items: [{
											"element": children.get(0),
											"selector": children.eq(0).selector
										}, {
											"element": children.get(1),
											"selector": children.eq(1).selector
										}, {
											"element": children.get(2),
											"selector": children.eq(2).selector
										}]
									});

									console.group(v);
								});

								types = values[value];
								container = types.container;
								items = types.items;

								describe("container", function () {
									before(function () {
										console.group("container");
									});

									for (rect in container) {
										var val = window.parseFloat(container[rect]);
										buildTest(target[0], rect, val);
									}


									for (i = 0, j = items.length; i < j; i++) {
										var name = ":nth-child(" + (i + 1) + ")";

										describe(name, function () {
											var n = name;

											before(function () {
												console.group(n);
											});

											child = items[i];

											for (rect in child) {
												var val = window.parseFloat(child[rect]);
												buildTest(children[i], rect, val);
											}

											after(function () {
												console.groupEnd(n);
											});
										});
									}

									after(function () {
										console.groupEnd("container");
									});
								});

								after(function () {
									console.groupEnd(v);
								});
							});
						}

						after(function () {
							console.groupEnd(p);
						});
					});
				}

				return deferred.resolve();
			});

			return deferred.promise();
		}
	};
});
