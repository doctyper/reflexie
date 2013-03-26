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
	var prevItem;

	var mainTotal = mainStart + "Total";
	var crossTotal = crossStart + "Total";

	var currMainStart = 0;
	var prevMainStart = 0;
	var currCrossStart = 0;
	var prevCrossStart = 0;

	var multiplier = isReverse ? -1 : 1;

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var breakPoint = containerSize;

		var revValues = {
			"top": "bottom",
			"left": "right"
		};

		var revStart = revValues[mainStart];

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];

			if (currMainStart + (item[mainSize] + item.debug.inner[mainStart] + item.debug.margin[mainTotal]) > breakPoint) {
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
			item[crossStart] += prevCrossStart;

			currMainStart += (item[mainSize] + item.debug.inner[mainStart]) + item.debug.margin[mainTotal];
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

	// Expose lines
	this.lines = lines;
};
