Flexbox.models.flexWrap = function (wrap, properties) {
	var values = this.values;
	var itemValues = values.items;

	var i, j;

	var isWrap = (wrap === "wrap");
	var isWrapReverse = (wrap === "wrap-reverse");

	var crossStart = this.crossStart;
	var mainStart = this.mainStart;

	var mainSize = this.mainSize;
	var crossSize = this.crossSize;

	var containerSize = values.container[mainSize];
	var lines = [];

	var line = {
		items: [],
		totalSize: 0
	};

	var utils = Flexbox.utils,
		revArray = ["row-reverse", "column-reverse"],
		isReverse = utils.assert(properties["flex-direction"], revArray);

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var storedVal = itemValues[0][mainStart],
			breakpoint = !isReverse ? containerSize : 0,
			maxMainStart = 0,
			persistAxis, size, items, item,
			itemMainStart, prevSize,
			currMainSize,
			currCrossSize;

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];

			currMainSize = !isReverse ? item[mainSize] : 0;
			currCrossSize = item[crossSize];
			itemMainStart = item[mainStart];
			size = itemMainStart + currMainSize;

			if ((!isReverse && size > breakpoint) || (isReverse && size < breakpoint)) {
				if (!persistAxis) {
					persistAxis = maxMainStart;

					if (!isReverse) {
						storedVal += itemMainStart;
					} else {
						items = line.items;
						storedVal = containerSize - items[items.length - 1][mainStart];
					}

					lines.push(line);

					line = {
						items: [],
						totalSize: 0
					};
				}

				if (size > (breakpoint + containerSize)) {
					persistAxis += maxMainStart;
					breakpoint += (containerSize - prevSize);
					storedVal = itemMainStart;

					maxMainStart = 0;

					lines.push(line);

					line = {
						items: [],
						totalSize: 0
					};
				}

				item[crossStart] = persistAxis;
				item[mainStart] -= storedVal * (isReverse ? -1 : 1);
			}

			line.items.push(item);

			line.totalSize += item[mainSize];

			maxMainStart = Math.max(maxMainStart, currCrossSize);
			prevSize = item[mainStart] + item[mainSize];
		}
	} else {
		line.items = values.items;
	}

	lines.push(line);

	// Expose lines
	this.lines = lines;
};
