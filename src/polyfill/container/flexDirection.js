Flexbox.models.flexDirection = function (direction) {
	var values = this.values,
		container = values.container,
		itemValues = values.items,
		i, j, item,
		utils = Flexbox.utils,
		colArray = ["column", "column-reverse"],
		revArray = ["row-reverse", "column-reverse"],
		isColumn = utils.assert(direction, colArray),
		isReverse = utils.assert(direction, revArray),
		crossStart = (isColumn ? "left" : "top"),
		mainStart = (isColumn ? "top" : "left"),
		mainSize = Flexbox.dimValues[mainStart],
		crossSize = Flexbox.dimValues[crossStart],
		mainStartOffset = 0,
		storedVal = 0,
		mainTotal = mainStart + "Total",
		containerSize = container[mainSize];

	for (i = 0, j = itemValues.length; i < j; i++) {
		item = itemValues[i];

		item[mainStart] = (storedVal + container.debug.padding[mainStart]);
		item[crossStart] = (storedVal + container.debug.padding[crossStart]);

		if (isReverse) {
			item[mainStart] = ((containerSize + container.debug.padding[mainStart]) - (item[mainSize] + item.debug.inner[mainStart]) - item.debug.margin[mainTotal]) - mainStartOffset;
		} else {
			item[mainStart] += mainStartOffset;
		}

		mainStartOffset += item[mainSize] + item.debug.margin[mainTotal];

		if (isColumn && !isReverse) {
			mainStartOffset += item.debug.inner[mainStart];
		} else if (isReverse) {
			mainStartOffset += item.debug.inner[mainStart];
		}
	}

	// flex-direction sets which properties need updates
	// Expose these for use later.
	this.crossStart = crossStart;
	this.mainStart = mainStart;

	this.mainSize = mainSize;
	this.crossSize = crossSize;
};
