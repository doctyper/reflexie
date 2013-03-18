Flexbox.models.flexGrow = function (flewGrow, properties) {
	// Check for space, otherwise exit
	var values = this.values,
		container = values.container,

		crossStart = this.crossStart,
		mainStart = this.mainStart,

		mainSize = this.mainSize,
		crossSize = this.crossSize,

		containerMainSize = container[mainSize],
		containerCrossSize = container[crossSize],
		lines = this.lines;

	var utils = Flexbox.utils,
		colArray = ["column", "column-reverse"],
		revArray = ["row-reverse", "column-reverse"],
		flexDirection = properties["flex-direction"],
		isColumn = utils.assert(flexDirection, colArray),
		isReverse = utils.assert(flexDirection, revArray);

	var i, ilim, j, jlim, line, noOfItems, usedSpace,
		availSpace, flexTotal, curr, runningDiff, dir;

	for (i = 0, ilim = lines.length; i < ilim; i++) {
		line = lines[i];
		noOfItems = line.items.length;

		// TODO Properly: calculate hypothetical main and cross size of each item
		// Currently just use width/height (i.e. borders will currently make this wrong!)

		usedSpace = 0;
		for (j = 0; j < noOfItems; j++) {
			usedSpace += line.items[j][mainSize];
		}

		// TODO Properly: Determine the available main and cross space for the flex items (9.2)
		// Currently just using containerMainSize

		availSpace = containerMainSize - usedSpace;

		if (availSpace < 0) {
			// Need flex-shrink rather than flex-grow
			return properties;
		}

		flexTotal = 0;
		for (j = 0; j < noOfItems; j++) {
			curr = line.items[j].debug.properties["flex-grow"];
			if (!curr || isNaN(curr) || curr < 0) {
				curr = line.items[j].debug.properties["flex-grow"] = 0;
			}
			flexTotal += curr;
		}


		if (flexTotal <= 0) {
			// Nothing can grow - do nothing!
			return properties;
		}

		// TODO: Implent min/max-width/height support
		runningDiff = 0;
		dir = (isReverse ?  -1 : 1);
		for (j = 0; j < noOfItems; j++) {
			curr = (availSpace * line.items[j].debug.properties["flex-grow"]) / flexTotal;
			line.items[j][mainStart] += (isReverse ?  -runningDiff - curr : runningDiff);
			line.items[j][mainSize] += curr;
			runningDiff += curr;
		}
	}

};