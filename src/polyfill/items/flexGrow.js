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
		availSpace, flexTotal, curr, maxSize, runningDiff,
		dir, minMaxChange, freezeList;

	for (i = 0, ilim = lines.length; i < ilim; i++) {
		line = lines[i];
		noOfItems = line.items.length;
		freezeList = new Array(noOfItems);

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


		if (flexTotal == 0) {
			// Nothing can grow - do nothing!
			return properties;
		}

		// Max-width/height support (for flex-grow, min support is handled by the browser!)
		// This could be made faster, but currently it's more debug-able in this form
		minMaxChange = 1;
		while(minMaxChange){
			minMaxChange = 0;
			for (j = 0; j < noOfItems; j++) {
				curr = (availSpace * line.items[j].debug.properties["flex-grow"]) / flexTotal;
				maxSize = line.items[j].debug.properties["max-"+mainSize];
				if (maxSize && isNaN(freezeList[j]) && (line.items[j][mainSize] + curr > maxSize)) {
					minMaxChange = 1;
					// use freezeList to store the amount we have to change the element by
					freezeList[j] = maxSize - line.items[j][mainSize];
					flexTotal -= line.items[j].debug.properties["flex-grow"];
					availSpace -= freezeList[j];
					// This stops a divide by zero later whilst allowing the re-flow of max-width/height items
					if(flexTotal == 0) flexTotal = 1;
				}
			}
		}

		runningDiff = 0;
		dir = (isReverse ?  -1 : 1);
		for (j = 0; j < noOfItems; j++) {
			curr = (!isNaN(freezeList[j]) ? freezeList[j] : (availSpace * line.items[j].debug.properties["flex-grow"]) / flexTotal);
			line.items[j][mainStart] += (isReverse ?  -runningDiff - curr : runningDiff);
			line.items[j][mainSize] += curr;
			runningDiff += curr;
			// For Debug uncomment next line
			// console.log("Item ", j, "'s ", mainStart, " was moved by ", (isReverse ?  -runningDiff - curr : runningDiff), " and inc ", mainSize ," by ", curr)
		}
	}

};
