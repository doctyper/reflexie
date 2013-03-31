Flexbox.models.flexWrap = function (wrap, properties) {
	var values = this.values;
	var itemValues = values.items;

	var i, j, k, l;

	var isWrap = (wrap === "wrap");
	var isWrapReverse = (wrap === "wrap-reverse");

	var crossStart = this.crossStart;
	var mainStart = this.mainStart;

	var mainSize = this.mainSize;
	var crossSize = this.crossSize;

	var container = values.container;
	var containerSize = container[mainSize];
	var lines = [];

	var line = {
		items: []
	};

	var utils = Flexbox.utils,
		colArray = ["column", "column-reverse"],
		revArray = ["row-reverse", "column-reverse"],
		flexDirection = properties["flex-direction"],
		isColumn = utils.assert(flexDirection, colArray),
		isReverse = utils.assert(flexDirection, revArray);

	var item;
	var items;
	var prevItem, itemSize;

	var mainTotal = mainStart + "Total";
	var crossTotal = crossStart + "Total";

	var currMainStart = 0;
	var prevMainStart = 0;
	var currCrossStart = 0;
	var prevCrossStart = 0;

	var multiplier = (isReverse ? -1 : 1);
	var reverser = (isWrapReverse ? -1 : 1);

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var breakPoint = containerSize;

		var revValues = {
			"top": "bottom",
			"left": "right"
		};

		var revStart = revValues[mainStart];

		if (isWrapReverse) {
			var maxNoWrapLineSize = 0;

			for (i = 0, j = itemValues.length; i < j; i++) {
				item = itemValues[i];
				maxNoWrapLineSize = Math.max(maxNoWrapLineSize, item[crossSize] + item.debug.inner[crossStart] + item.debug.margin[crossTotal]);
			}

			var revStartRemainder = containerSize - maxNoWrapLineSize;

			for (i = 0, j = itemValues.length; i < j; i++) {
				item = itemValues[i];
				item[crossStart] += revStartRemainder + (maxNoWrapLineSize - (item[crossSize] + item.debug.inner[crossStart] + item.debug.margin[crossTotal]));
			}
		}

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];
			itemSize = utils.flexBasisToPx(item.debug.properties['flex-basis'], item[mainSize] + item.debug.inner[mainStart] + item.debug.margin[mainTotal], containerSize);

			if (currMainStart + itemSize > breakPoint) {
				lines.push(line);

				line = {
					items: []
				};

				prevMainStart += currMainStart;
				prevCrossStart += currCrossStart;

				if (isColumn && prevItem) {
					var newLineStart;

					if (isReverse) {
						newLineStart = ((item[mainStart] - container.debug.padding[mainStart]) + item[mainSize] + item.debug.inner[mainStart] + item.debug.margin[mainTotal]) - (prevMainStart * multiplier) - breakPoint;
					} else {
						newLineStart = (prevMainStart * multiplier) - (item[mainStart] - container.debug.padding[mainStart]);
					}

					if (newLineStart > 0) {
						prevMainStart -= newLineStart;
					}
				}

				currMainStart = 0;
				currCrossStart = 0;
			}

			item[mainStart] -= prevMainStart * multiplier;
			item[crossStart] += prevCrossStart * reverser;

			currMainStart += itemSize;
			currCrossStart = Math.max(currCrossStart, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);

			if (isColumn) {
				if (prevItem) {
					currMainStart += Math.min(item.debug.margin[mainStart], prevItem.debug.margin[revStart]);
				}

				prevItem = item;
			}

			line.items.push(item);
		}
	} else {
		line.items = values.items;
	}

	lines.push(line);

	prevMainStart = 0;

	// Adjust positioning for padding
	if (!isColumn && !isReverse) {
		for (i = 0, j = lines.length; i < j; i++) {
			items = lines[i].items;

			for (k = 0, l = items.length; k < l; k++) {
				item = items[k];

				if (prevItem) {
					prevMainStart += prevItem.debug.inner[mainStart];
					item[mainStart] += prevMainStart;
				}

				prevItem = item;
			}
		}
	}

	// Expose lines
	this.lines = lines;

	// Expose reverser
	this.reverser = reverser;
};
