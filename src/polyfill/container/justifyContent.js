Flexbox.models.justifyContent = function (justification, properties) {
	var values = this.values,
		containerValues = values.container,
		mainStart = this.mainStart,
		mainSize = this.mainSize,
		containerSize = containerValues[mainSize],
		isStart = (justification === "flex-start"),
		isCenter = (justification === "center"),
		isBetween = (justification === "space-between"),
		isAround = (justification === "space-around"),
		lines = this.lines,
		i, j, k, l, line, eol, items,
		lineEnd, lineRemainder,
		multiplier = 1, x, y;

	if (isStart) {
		return;
	}

	if (isCenter) {
		multiplier = 0.5;
	}

	for (i = 0, j = lines.length; i < j; i++) {
		k = 0;
		x = 0;
		line = lines[i];
		items = line.items;
		l = items.length;
		eol = items[l - 1];

		lineEnd = eol[mainStart] + eol[mainSize];
		lineRemainder = (containerSize - lineEnd) * multiplier;

		if (isBetween || isAround) {
			k = 1;
			lineRemainder /= (l - (isBetween ? 1 : 0));
			x = lineRemainder;

			if (isAround) {
				y = (lineRemainder * 0.5);
				items[0][mainStart] += y;
				lineRemainder += y;
			}
		}

		for (; k < l; k++) {
			items[k][mainStart] += lineRemainder;
			lineRemainder += x;
		}
	}
};
