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
		containerSize, itemTotalSize, containerFarInnerEdge;

	var prevItem;
	var prevMainStart = 0;
	var mainTotal = mainStart + "Total";

	var revValues = {
		"top": "bottom",
		"left": "right"
	};

	containerSize = container[mainSize];
	containerFarInnerEdge = containerSize + container.debug.padding[mainStart];

	var revStart = revValues[mainStart];

	for (i = 0, j = itemValues.length; i < j; i++) {
		item = itemValues[i];
		item[crossStart] = (storedVal + container.debug.padding[crossStart]);
		itemTotalSize = item[mainSize] + item.debug.padding[mainTotal] + item.debug.border[mainTotal] + item.debug.margin[mainTotal];

		if (isReverse) {
			item[mainStart] = containerFarInnerEdge - itemTotalSize - incrementVal;
		} else {
			item[mainStart] = incrementVal;
		}
		console.log(containerFarInnerEdge, itemTotalSize, incrementVal);
		incrementVal += itemTotalSize;
	}

	// flex-direction sets which properties need updates
	// Expose these for use later.
	this.crossStart = crossStart;
	this.mainStart = mainStart;

	this.mainSize = mainSize;
	this.crossSize = crossSize;
};
