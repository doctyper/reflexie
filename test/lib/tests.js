define([
	"jquery",
	"dist/reflexie",
	"lib/mocha",
	"lib/expect"
], function ($, Flexie) {
	"use strict";

	var DEBUG = false;

	/*var buildTest = function (el, rect, val) {
		var box;
		val = Math.floor(val);

		it(rect + " should be " + val, function () {
			if (typeof el === "number") {
				el = $("#flex-target").children()[el];
			}

			box = el.getBoundingClientRect();
			expect(Math.floor(box[rect])).to.equal(val);
			logger.log("expect", Math.floor(box[rect]), "to equal", val);
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
				selector: "#" + selector,
				element: element[0]
			});

			target.append(element);
		}

		return set;
	};*/

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
		/*describeItem : function (item, index, child) {
			var rect, val;

			before(function () {
				logger.group(item);
			});

			for (rect in child) {
				val = window.parseFloat(child[rect]);
				buildTest(index, rect, val);
			}

			after(function () {
				logger.groupEnd(item);
			});
		},

		buildItemDescription : function (description, iterator, index) {
			describe(description, function () {
				this.describeItem(description, index, iterator[index]);
			}.bind(this));
		},

		describeContainer : function (container, items) {
			var target = this.target,
				rect, val, i, j, item;

			before(function () {
				logger.group("container");
			});

			for (rect in container) {
				val = window.parseFloat(container[rect]);
				buildTest(target[0], rect, val);
			}

			for (i = 0, j = items.length; i < j; i++) {
				item = ":nth-child(" + (i + 1) + ")";
				this.buildItemDescription(item, items, i);
			}

			after(function () {
				logger.groupEnd("container");
			});
		},

		describeValue : function (property, value, types, extra) {
			var target = this.target,
				flexProp = ($.browser.chrome ? "-webkit-" : "") + "flex",
				container = types.container,
				items = types.items,
				dependencies = types.dependencies,
				set, flex;

			var styles = {
				"flex-direction": "row",
				"flex-wrap": "nowrap",
				"justify-content": "flex-start",
				"align-items": "stretch",
				"align-content": "stretch"
			};

			before(function () {
				if (extra) {
					extra = value.split(";")[0];
				}

				set = appendFlexChildren(target, dependencies);

				target.removeAttr("style");

				for (var key in dependencies.properties) {
					styles[key] = dependencies.properties[key];
				}

				styles.display = flexProp;
				styles[property] = extra || value;

				target.css(styles);

				if (extra && dependencies.map && dependencies.map[extra]) {
					target.children().css(dependencies.map[extra]);
				}

				flex = new Flexie({
					container: {
						"element": target[0],
						"selector": "#flex-target",
						"properties": styles
					},

					items: set
				});

				logger.group(extra || value);
			});

			describe("container", function () {
				this.describeContainer(container, items);
			}.bind(this));

			after(function () {
				logger.groupEnd(value);
			});
		},

		buildValueDescription : function (value, property, values) {
			describe(value, function () {
				var extra = value.indexOf(";") !== -1;
				this.describeValue(property, value, values[value], extra);
			}.bind(this));
		},

		describeProperty : function (property, values) {
			var value, extra;

			before(function () {
				logger.group(property);
			});

			for (value in values) {
				this.buildValueDescription(value, property, values);
			}

			after(function () {
				logger.groupEnd(property);
			});
		},

		buildPropertyDescription : function (property, value) {
			describe(property, function () {
				this.describeProperty(property, value);
			}.bind(this));
		},*/

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

						flex.css("display", "-webkit-flex");
						flex.css(rules);

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
