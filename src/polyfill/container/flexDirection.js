Flexbox.models.flexDirection = function (direction, properties) {
	var values = this.values,
		container = values.container,
		itemValues = values.items,
		i, j, item, incrementVal = 0,
		utils = Flexbox.utils,
		colArray = ["column", "column-reverse"],
		revArray = ["row-reverse", "column-reverse"],
		isColumn = utils.assert(direction, colArray),
		isReverse = utils.assert(direction, revArray),
		needsIncrement = (!isColumn || isReverse),
		crossStart = (isColumn ? "left" : "top"),
		mainStart = (isColumn ? "top" : "left"),
		mainSize = Flexbox.dimValues[mainStart],
		crossSize = Flexbox.dimValues[crossStart],
		storedVal = 0,
		containerSize;

	var prevItem, itemSize;
	var prevMainStart = 0;
	var mainTotal = mainStart + "Total";

	var revValues = {
		"top": "bottom",
		"left": "right"
	};

	containerSize = container[mainSize];

	var revStart = revValues[mainStart];

	incrementVal = (isReverse ? -1 : 1) * container.debug.padding[mainStart];

	for (i = 0, j = itemValues.length; i < j; i++) {
		item = itemValues[i];
		itemSize = item[mainSize] + item.debug.margin[mainTotal] + item.debug.border[mainTotal] + item.debug.padding[mainTotal];
		item[crossStart] = (storedVal + container.debug.padding[crossStart]);

		if (isReverse) {
			item[mainStart] = containerSize - itemSize - incrementVal;
		} else {
			item[mainStart] = incrementVal;
		}

		incrementVal += itemSize;
	}

	// flex-direction sets which properties need updates
	// Expose these for use later.
	this.crossStart = crossStart;
	this.mainStart = mainStart;

	this.mainSize = mainSize;
	this.crossSize = crossSize;
};
