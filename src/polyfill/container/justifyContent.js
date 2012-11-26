Flexbox.models.justifyContent = function (justification, properties) {
	var values = this.values,
		utils = Flexbox.utils,
		containerValues = values.container,
		mainStart = this.mainStart,
		mainSize = this.mainSize,
		containerSize = containerValues[mainSize],
		isStart = (justification === "flex-start"),
		isCenter = (justification === "center"),
		isBetween = (justification === "space-between"),
		isAround = (justification === "space-around"),
		revArray = ["row-reverse", "column-reverse"],
		isReverse = utils.assert(properties["flex-direction"], revArray),
		lines = this.lines,
		i, j, k, l, line, items, item,
		lineRemainder, multiplier = 1, x, y;

	isReverse = (isReverse) ? -1 : 1;

	var mainTotal = mainStart + "Total";

	if (isStart) {
		return;
	}

	for (i = 0, j = lines.length; i < j; i++) {
		x = 0;
		line = lines[i];
		items = line.items;
		l = items.length;
		multiplier = 1;

		lineRemainder = containerSize;

		for (k = 0; k < l; k++) {
			item = items[k];
			lineRemainder -= (item[mainSize] + item.debug.padding[mainTotal]) + item.debug.margin[mainTotal];
		}

		if (isCenter || isAround && lineRemainder < 0) {
			multiplier = 0.5;
		}

		lineRemainder *= multiplier;

		k = 0;

		if (isBetween || isAround && lineRemainder >= 0) {
			k = 1;

			lineRemainder = Math.max(0, lineRemainder);
			lineRemainder /= (l - (isBetween ? 1 : 0));

			x = lineRemainder;

			if (isAround) {
				y = (lineRemainder * 0.5);
				items[0][mainStart] += (y * isReverse);
				lineRemainder += y;
			}
		}

		for (; k < l; k++) {
			items[k][mainStart] += (lineRemainder * isReverse);
			lineRemainder += x;
		}
	}
};
