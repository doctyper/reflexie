/*global describe, it, expect*/

"use strict";

$.getJSON("data/flex.js", function (json) {
	for (var property in json) {
		describe(property, function () {
			var values = json[property];

			for (var value in values) {
				describe(value, function () {
					var types = values[value],
						container = types.container,
						items = types.items;

					describe("container", function () {
						for (var rect in container) {
							var val = container[rect];

							it(rect + " should be " + val, function () {
								expect(val).to.equal(val);
							});
						}
					});

					for (var i = 0, j = items.length; i < j; i++) {
						describe(":nth-child(" + (i + 1) + ")", function () {
							var child = items[i];

							for (var rect in child) {
								var val = child[rect];

								it(rect + " should be " + val, function () {
									expect(val).to.equal(val);
								});
							}
						});
					}
				});
			}
		});
	}
});
