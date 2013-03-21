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
			selector, elements, current,
			key, sibling, specificity, combinedMap,
			keys = this.keys(map), dominant,
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
						var match = this.matchesSelector(current, sibling);

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
