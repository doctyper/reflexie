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

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var storedVal = itemValues[0][mainStart],
			breakpoint = containerSize,
			maxMainStart = 0,
			persistAxis, size, item,
			itemMainStart, prevSize,
			currMainSize,
			currCrossSize;

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];

			currMainSize = item[mainSize];
			currCrossSize = item[crossSize];
			itemMainStart = item[mainStart];
			size = itemMainStart + currMainSize;

			if (size > breakpoint) {
				if (!persistAxis) {
					persistAxis = maxMainStart;
					storedVal += itemMainStart;

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
				item[mainStart] -= storedVal;
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
