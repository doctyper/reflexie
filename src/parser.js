Flexbox.parser = {
	properties : {
		container : {
			"display": ["flex", "inline-flex"],
			"flex-direction": true,
			"flex-wrap": true,
			"justify-content": true,
			"align-items": true,
			"align-content": true,

			// Shorthand support
			// Combines flex-direction and flex-wrap
			"flex-flow": true
		},

		items : {
			"order": true,
			"flex-grow": true,
			"flex-shrink": true,
			"flex-basis": true,
			"align-self": true,

			// Shorthand support
			// Combines flex-grow, flex-shrink, and flex-basis
			"flex": true
		}
	},

	onStylesLoaded : function (stylesheets) {
		var parser = new CSSParser(),
			support = Flexie.support,
			i, j, sheet, relation, relationships, flex;

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
			relation = relationships[i];

			if (support === true) {
				flex = new Flexie(relation);
			} else if (support === "partial") {
				this.mapPartialSupportRules(relation);
			}
		}
	},

	getPrefix : function () {
		if (this.prefix) {
			return this.prefix;
		}

		var dummy = document.createElement("flx"),
			prefixes = ["", "ms", "webkit", "moz", "o"],
			testProp = "FlexOrder",
			i, j, prefix, prop;

		for (i = 0, j = prefixes.length; i < j; i++) {
			prefix = prefixes[i];
			prop = prefix + testProp;

			if (typeof dummy.style[prop] !== "undefined") {
				prefix = prefix ? ("-" + prefix + "-") : prefix;
				break;
			}
		}

		this.prefix = prefix;
		return prefix;
	},

	mapPartialSupportRules : function (relation) {
		var prefix = this.getPrefix();

		var container = relation.container.properties,
			items = relation.items,
			i, j, parts, part, item, flex,
			partialProperties, partialValues,
			prop, val;

		if (container.display) {
			// IE10 undersands display: flexbox; or display: inline-flexbox;
			container.display = prefix + container.display + "box";
		}

		// IE10: No support for flex-flow?
		if (container["flex-flow"]) {
			parts = container["flex-flow"].split(" ");

			for (i = 0, j = parts.length; i < j; i++) {
				part = parts[i];

				if ((/row|column/).test(part)) {
					container["flex-direction"] = part;
				} else {
					if (part === "nowrap") {
						part = "none";
					}

					container["flex-wrap"] = part;
				}
			}

			delete container["flex-flow"];
		}

		partialProperties = {
			"flex-direction": "flex-direction",
			"flex-wrap": "flex-wrap",
			"justify-content": "flex-pack",
			"align-items": "flex-align",
			"align-content": "flex-line-pack"
		};

		partialValues = {
			"flex-start": "start",
			"flex-end": "end",
			"space-between": "justify",
			"space-around": "distribute"
		};

		for (prop in partialProperties) {
			if (typeof container[prop] !== "undefined") {
				container[prefix + partialProperties[prop]] = partialValues[container[prop]] || container[prop];
				delete container[prop];
			}
		}

		partialProperties = {
			"align-self": "flex-item-align",
			"order": "flex-order",
			"flex-grow": "flex-positive",
			"flex-shrink": "flex-negative",
			"flex-basis": "flex-preferred-size",
			"flex": "flex"
		};

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i].properties;

			for (prop in partialProperties) {
				if (typeof item[prop] !== "undefined") {
					item[prefix + partialProperties[prop]] = partialValues[item[prop]] || item[prop];
					delete item[prop];
				}
			}
		}

		// Flag as partial support
		relation.partial = true;

		flex = new Flexie(relation);
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
		var rules = this.validateRules(this.properties.container, styles);

		// For container to be valid, it must have a display value
		// Of either flex or inline-flex
		var display = (rules || {}).display;

		switch (display) {
		case "flex":
		case "inline-flex":
			return rules;
		}

		return undefined;
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

	appendNthChildSelector : function (item, index) {
		this.supportsNth = this.supportsNth || Flexbox.utils.nthChildSupport();

		var supportsNth = this.supportsNth,
			nth;

		if (supportsNth) {
			nth = ":nth-child(" + (index + 1) + ")";
		} else {
			nth = "nth-child-" + (index + 1);
			item.className += " " + nth;
			nth = "." + nth;
		}

		return nth;
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
			parts.push(this.appendNthChildSelector(item, index));
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
							selector: item + this.appendNthChildSelector(child, x),
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
			i, j;

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

		// Rules are returned in order of cascade
		// We want them in ascending order
		for (i = rules.length - 1, j = 0; i >= j; i--) {
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
