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

	var prevItem;
	var prevMainStart = 0;
	var mainTotal = mainStart + "Total";

	var revValues = {
		"top": "bottom",
		"left": "right"
	};

	containerSize = container[mainSize];
	incrementVal -= (container.debug.margin[mainStart] + container.debug.border[mainStart]);

	var revStart = revValues[mainStart];

	for (i = 0, j = itemValues.length; i < j; i++) {
		item = itemValues[i];
		item[crossStart] = (storedVal + container.debug.padding[crossStart]);

		if (isReverse) {
			item[mainStart] = ((containerSize + container.debug.padding[mainStart]) - (item[mainSize] + item.debug.inner[mainStart]) - item.debug.margin[mainTotal]) - incrementVal;
		} else {
			item[mainStart] += incrementVal;
			item[mainStart] -= item.debug.margin[mainStart];

			if (isColumn) {
				if (prevItem) {
					prevMainStart += Math.min(item.debug.margin[mainStart], prevItem.debug.margin[revStart]);
					item[mainStart] += prevMainStart;
				}

				prevItem = item;
			}
		}

		if (needsIncrement) {
			incrementVal += item[mainSize] + item.debug.margin[mainTotal];

			if (isReverse) {
				incrementVal += item.debug.inner[mainStart];
			}
		}
	}

	// flex-direction sets which properties need updates
	// Expose these for use later.
	this.crossStart = crossStart;
	this.mainStart = mainStart;

	this.mainSize = mainSize;
	this.crossSize = crossSize;
};
