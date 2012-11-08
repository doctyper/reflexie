Flexbox.models.flexWrap = function (wrap, properties) {
	// var container = this.container;
	// var items = this.items;
	var values = this.values;
	var itemValues = values.items;

	var i, j;

	var primaryAxis = this.primaryAxis;
	var secondaryAxis = this.secondaryAxis;

	var primaryDimension = this.primaryDimension;
	var secondaryDimension = this.secondaryDimension;

	var containerSize = values.container[primaryDimension];

	if (wrap === "wrap" || wrap === "wrap-reverse") {
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
				}

				if (size > (breakpoint + containerSize)) {
					persistAxis += maxSecondaryAxis;
					breakpoint += (containerSize - prevSize);
					storedVal = itemSecondaryAxis;

					maxSecondaryAxis = 0;
				}

				item[primaryAxis] = persistAxis;
				item[secondaryAxis] -= storedVal;
			}

			maxSecondaryAxis = Math.max(maxSecondaryAxis, currSecondaryDimension);
			prevSize = item[secondaryAxis] + item[primaryDimension];
		}
	}
};
