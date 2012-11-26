Flexbox.models.alignContent = function (alignment, properties) {
	var values = this.values,
		containerValues = values.container,

		crossStart = this.crossStart,
		mainStart = this.mainStart,

		mainSize = this.mainSize,
		crossSize = this.crossSize,

		containerSize = containerValues[crossSize],
		isStart = (alignment === "flex-start"),
		isCenter = (alignment === "center"),
		isBetween = (alignment === "space-between"),
		isAround = (alignment === "space-around"),
		isStretch = (alignment === "stretch"),
		isNotFlexWrap = (properties["flex-wrap"] === "nowrap"),
		lines = this.lines,
		i, j, k, l, line, items, item,
		lineEnd, lineRemainder,
		multiplier = 1, x, y;

	var alignItems = properties["align-items"];
	var isAlignItemsStretch = alignItems === "stretch";
	var crossTotal = crossStart + "Total";

	// http://www.w3.org/TR/css3-flexbox/#align-content-property
	//  Note, this property has no effect when the flexbox has only a single line.
	if (isNotFlexWrap && lines.length <= 1) {
		return;
	}

	if (isStart) {
		return;
	}

	lineRemainder = containerSize;

	for (i = 0, j = lines.length; i < j; i++) {
		x = 0;
		line = lines[i].items;

		for (k = 0, l = line.length; k < l; k++) {
			item = line[k];
			x = Math.max(x, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
		}

		lineRemainder -= x;
	}

	i = 0;
	x = 0;

	if ((isBetween || isAround) && lineRemainder <= 0) {
		if (isAround) {
			isAround = false;
			isCenter = true;
		} else {
			return;
		}
	}

	if (isCenter) {
		multiplier = 0.5;
	}

	if (isBetween || isAround || isStretch) {
		i = 1;

		lineRemainder /= (j - (!isBetween ? 0 : 1));
		x = lineRemainder;

		if (isAround) {
			y = (lineRemainder * 0.5);

			items = lines[0].items;

			for (k = 0, l = items.length; k < l; k++) {
				items[k][crossStart] += y;
			}

			lineRemainder += y;
		}
	}

	for (j = lines.length; i < j; i++) {
		item = lines[i].items;

		for (k = 0, l = item.length; k < l; k++) {
			item[k][crossStart] += (lineRemainder * multiplier);
		}

		lineRemainder += x;
	}

	if (isStretch && isAlignItemsStretch) {
		var prevCrossSize = 0;

		for (i = 0, j = lines.length; i < j; i++) {
			items = lines[i].items;

			var next = lines[i + 1];
			var lineCrossSize = containerSize;

			if (next) {
				lineCrossSize = next.items[0][crossStart];
			}

			lineCrossSize -= prevCrossSize;

			for (k = 0, l = items.length; k < l; k++) {
				item = items[k];
				item[crossSize] = ((lineCrossSize - item.debug.inner[crossStart]) - item.debug.margin[crossTotal]);
			}

			prevCrossSize += lineCrossSize;
		}
	}
};
