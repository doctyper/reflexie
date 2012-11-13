Flexbox.models.alignItems = function (alignment, properties) {
	var crossStart = this.crossStart,
		crossSize = this.crossSize,
		multiplier = 1,
		lines = this.lines,
		i, j, k, l, line, items, item,
		lineRemainder;

	var values = this.values;
	var mainSize = this.mainSize;
	var containerSize = values.container[mainSize];

	if (alignment === "stretch") {
		items = values.items;
		lineRemainder = values.container[crossSize] / lines.length;

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;

			for (k = 0; k < l; k++) {
				item = items[k];

				if (item.auto[crossSize]) {
					if (i) {
						item[crossStart] += (lineRemainder * i) - item[crossSize];
					}

					item[crossSize] = lineRemainder;
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
			line.maxItemSize = Math.max(line.maxItemSize, items[k][crossSize]);
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
			items[k][crossStart] += remainderSize + (lineRemainder - items[k][crossSize]) * multiplier;
		}
	}
};
