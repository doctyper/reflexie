define([
	"jquery",
	"reflexie/reflexie",
	"lib/mocha",
	"lib/expect"
], function ($, Flexbox) {
	"use strict";

	var buildTest = function (el, rect, val) {
		var box;

		it(rect + " should be " + val, function () {
			if (typeof el === "number") {
				el = $("#flex-target").children()[el];
			}

			box = el.getBoundingClientRect();
			expect(box[rect]).to.equal(val);
			console.log("expect", box[rect], "to equal", val);
		});
	};

	var appendFlexChildren = function (target, dependencies) {
		var i, j, idx,
			set = [], selector, element,
			children = dependencies.childNodes;

		target.empty();

		for (i = 0, j = children; i < j; i++) {
			idx = (i + 1);
			selector = "flex-col-" + idx;
			element = $('<div id="' + selector + '">Col ' + idx + '</div>');

			set.push({
				selector: selector,
				element: element[0]
			})

			target.append(element);
		}

		return set;
	};

	return {
		describeItem : function (item, index, child) {
			var rect, val;

			before(function () {
				console.group(item);
			});

			for (rect in child) {
				val = window.parseFloat(child[rect]);
				buildTest(index, rect, val);
			}

			after(function () {
				console.groupEnd(item);
			});
		},

		describeContainer : function (container, items) {
			var target = this.target,
				rect, val, i, j, item;

			before(function () {
				console.group("container");
			});

			for (rect in container) {
				val = window.parseFloat(container[rect]);
				buildTest(target[0], rect, val);
			}

			for (i = 0, j = items.length; i < j; i++) {
				item = ":nth-child(" + (i + 1) + ")";

				describe(item, function () {
					this.describeItem(item, i, items[i]);
				}.bind(this));
			}

			after(function () {
				console.groupEnd("container");
			});
		},

		describeValue : function (property, value, types) {
			var target = this.target,
				flexProp = ($.browser.chrome ? "-webkit-" : "") + "flex",
				container = types.container,
				items = types.items,
				dependencies = types.dependencies,
				set, styles, flex;

			var styles = {
				"flex-direction": "row",
				"flex-wrap": "nowrap",
				"justify-content": "flex-start",
				"align-items": "stretch",
				"align-content": "stretch"
			};

			before(function () {
				set = appendFlexChildren(target, dependencies);

				target.removeAttr("style");

				for (var key in dependencies.properties) {
					styles[key] = dependencies.properties[key];
				}

				styles["display"] = flexProp;
				styles[property] = value;

				target.css(styles);

				flex = new Flexbox({
					container: {
						"element": target[0],
						"properties": styles
					},

					items: set
				});

				console.group(value);
			});

			describe("container", function () {
				this.describeContainer(container, items);
			}.bind(this));

			after(function () {
				console.groupEnd(value);
			});
		},

		describeProperty : function (property, values) {
			var value;

			before(function () {
				console.group(property);
			});

			for (value in values) {
				describe(value, function () {
					this.describeValue(property, value, values[value]);
				}.bind(this));
			}

			after(function () {
				console.groupEnd(property);
			});
		},

		handleJSON : function (json) {
			var deferred = $.Deferred(),
				property;

			for (property in json) {
				describe(property, function () {
					this.describeProperty(property, json[property]);
				}.bind(this));
			}

			return deferred.resolve();
		},

		setup : function () {
			var deferred = $.Deferred();

			document.title = "Running Tests...";

			this.target = $("#flex-target");

			$.getJSON("data/flex.js")
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
