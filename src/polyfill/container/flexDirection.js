Flexbox.models.flexDirection = function (direction, properties) {
	var values = this.values,
		utils = Flexbox.utils,
		containerValues = values.container,
		itemValues = values.items,
		i, j, item, incrementVal = 0,
		colArray = ["column", "column-reverse"],
		revArray = ["row-reverse", "column-reverse"],
		isColumn = utils.assert(direction, colArray),
		isReverse = utils.assert(direction, revArray),
		needsIncrement = (!isColumn || isReverse),
		crossStart = (isColumn ? "left" : "top"),
		mainStart = (isColumn ? "top" : "left"),
		mainSize = Flexbox.dimValues[mainStart],
		crossSize = Flexbox.dimValues[crossStart],
		storedVal = itemValues[0][crossStart],
		containerVal = containerValues[mainSize];

	for (i = 0, j = itemValues.length; i < j; i++) {
		item = itemValues[i];
		item[crossStart] = storedVal;

		if (isReverse) {
			item[mainStart] = (containerVal - item[mainSize]) - incrementVal;
		} else {
			item[mainStart] = item[mainStart] + incrementVal;
		}

		if (needsIncrement) {
			incrementVal += item[mainSize];
		}
	}

	// flex-direction sets which properties need updates
	// Expose these for use later.
	this.crossStart = crossStart;
	this.mainStart = mainStart;

	this.mainSize = mainSize;
	this.crossSize = crossSize;

	console.log("crossStart", this.crossStart);
	console.log("mainStart", this.mainStart);
	console.log("mainSize", this.mainSize);
	console.log("crossSize", this.crossSize);

};
