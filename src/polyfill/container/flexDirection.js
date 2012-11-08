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
		primaryAxis = (isColumn ? "left" : "top"),
		secondaryAxis = (isColumn ? "top" : "left"),
		primaryDimension = Flexbox.dimValues[secondaryAxis],
		secondaryDimension = Flexbox.dimValues[primaryAxis],
		storedVal = itemValues[0][primaryAxis],
		containerVal = containerValues[primaryDimension];

	for (i = 0, j = itemValues.length; i < j; i++) {
		item = itemValues[i];
		item[primaryAxis] = storedVal;

		if (isReverse) {
			item[secondaryAxis] = (containerVal - item[primaryDimension]) - incrementVal;
		} else {
			item[secondaryAxis] = item[secondaryAxis] + incrementVal;
		}

		if (needsIncrement) {
			incrementVal += item[primaryDimension];
		}
	}

	// flex-direction sets which properties need updates
	// Expose these for use later.
	this.primaryAxis = primaryAxis;
	this.secondaryAxis = secondaryAxis;

	this.primaryDimension = primaryDimension;
	this.secondaryDimension = secondaryDimension;
};
