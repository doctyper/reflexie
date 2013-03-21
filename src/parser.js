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

		return map;
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

	mapChildren : function (container, items) {
		var related = [];

		var children = container.childNodes,
			i, j, item, child;

		for (i = 0, j = children.length; i < j; i++) {
			child = children[i];

			if (child.nodeType === 1) {
				for (item in items) {
					if (this.matchesSelector(child, item)) {
						related.push({
							element: child,
							selector: item,
							properties: items[item]
						});
					}
				}
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
					children = this.mapChildren(containerElement, items);

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
