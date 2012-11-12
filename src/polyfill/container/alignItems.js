Flexbox.models.alignItems = function (alignment, properties) {
	var primaryAxis = this.primaryAxis,
		secondaryDimension = this.secondaryDimension,
		multiplier = 1,
		lines = this.lines,
		i, j, k, l, line, items, item,
		lineRemainder;

	var values = this.values;
	var primaryDimension = this.primaryDimension;
	var containerSize = values.container[primaryDimension];

	if (alignment === "stretch") {
		items = values.items;
		lineRemainder = values.container[secondaryDimension] / lines.length;

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;

			for (k = 0; k < l; k++) {
				item = items[k];

				if (item.auto[secondaryDimension]) {
					if (i) {
						item[primaryAxis] += (lineRemainder * i) - item[secondaryDimension];
					}

					item[secondaryDimension] = lineRemainder;
				}
			}
		}
	}

	if (alignment === "stretch" || alignment === "flex-start" || alignment === "baseline") {
		return;
	}

	if (alignment === "center") {
		multiplier = 0.5;
	}

	var remainderSize = containerSize;

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];
		items = line.items;
		l = items.length;

		for (k = 0; k < l; k++) {
			line.maxItemSize = Math.max(line.maxItemSize, items[k][secondaryDimension]);
		}

		remainderSize -= line.maxItemSize;
	}

	remainderSize /= lines.length;

	if (alignment === "center") {
		remainderSize *= 0.5;
	}

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];
		items = line.items;
		l = items.length;
		lineRemainder = line.maxItemSize;

		for (k = 0; k < l; k++) {
			items[k][primaryAxis] += remainderSize + (lineRemainder - items[k][secondaryDimension]) * multiplier;
		}
	}
};
