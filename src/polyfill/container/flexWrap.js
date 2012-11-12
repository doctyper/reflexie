Flexbox.models.flexWrap = function (wrap, properties) {
	var values = this.values;
	var itemValues = values.items;

	var i, j;

	var isWrap = (wrap === "wrap");
	var isWrapReverse = (wrap === "wrap-reverse");

	var primaryAxis = this.primaryAxis;
	var secondaryAxis = this.secondaryAxis;

	var primaryDimension = this.primaryDimension;
	var secondaryDimension = this.secondaryDimension;

	var containerSize = values.container[primaryDimension];
	var lines = [];

	var line = {
		items: [],
		totalSize: 0,
		maxItemSize: 0
	};

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var storedVal = itemValues[0][secondaryAxis],
			breakpoint = containerSize,
			maxSecondaryAxis = 0,
			persistAxis, size, item,
			itemSecondaryAxis, prevSize,
			currPrimaryDimension,
			currSecondaryDimension;

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];

			currPrimaryDimension = item[primaryDimension];
			currSecondaryDimension = item[secondaryDimension];
			itemSecondaryAxis = item[secondaryAxis];
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

				item[primaryAxis] = persistAxis;
				item[secondaryAxis] -= storedVal;
			}

			line.items.push(item);

			line.totalSize += item[primaryDimension];
			line.maxItemSize = Math.max(line.maxItemSize, item[primaryDimension]);

			maxSecondaryAxis = Math.max(maxSecondaryAxis, currSecondaryDimension);
			prevSize = item[secondaryAxis] + item[primaryDimension];
		}
	} else {
		line.items = values.items;
	}

	lines.push(line);

	// Expose lines
	this.lines = lines;
};
