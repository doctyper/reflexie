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
		totalSize: 0,
		maxItemSize: 0
	};

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var storedVal = itemValues[0][mainStart],
			breakpoint = containerSize,
			maxSecondaryAxis = 0,
			persistAxis, size, item,
			itemSecondaryAxis, prevSize,
			currPrimaryDimension,
			currSecondaryDimension;

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];

			currPrimaryDimension = item[mainSize];
			currSecondaryDimension = item[crossSize];
			itemSecondaryAxis = item[mainStart];
			size = itemSecondaryAxis + currPrimaryDimension;

			if (size > breakpoint) {
				if (!persistAxis) {
					persistAxis = maxSecondaryAxis;
					storedVal += itemSecondaryAxis;

					lines.push(line);

					line = {
						items: [],
						totalSize: 0,
						maxItemSize: 0
					};
				}

				if (size > (breakpoint + containerSize)) {
					persistAxis += maxSecondaryAxis;
					breakpoint += (containerSize - prevSize);
					storedVal = itemSecondaryAxis;

					maxSecondaryAxis = 0;

					lines.push(line);

					line = {
						items: [],
						totalSize: 0,
						maxItemSize: 0
					};
				}

				item[crossStart] = persistAxis;
				item[mainStart] -= storedVal;
			}

			line.items.push(item);

			line.totalSize += item[mainSize];
			line.maxItemSize = Math.max(line.maxItemSize, item[mainSize]);

			maxSecondaryAxis = Math.max(maxSecondaryAxis, currSecondaryDimension);
			prevSize = item[mainStart] + item[mainSize];
		}
	} else {
		line.items = values.items;
	}

	lines.push(line);

	// Expose lines
	this.lines = lines;
};
