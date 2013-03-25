// TODO: Remove this when ready.
Flexbox.models.alignItems = function (alignment, properties) {
	/*var crossStart = this.crossStart,
		crossSize = this.crossSize,
		multiplier = 1,
		lines = this.lines,
		i, j, k, l, line, items, item,
		lineRemainder;

	var values = this.values;
	var mainSize = this.mainSize;
	var containerSize = values.container[mainSize];

	var isStretch = (alignment === "stretch");
	var isStart = (alignment === "flex-start");
	var isBaseline = (alignment === "baseline");
	var isCenter = (alignment === "center");

	var isNotFlexWrap = properties["flex-wrap"] === "nowrap";
	var isAlignContentStretch = properties["align-content"] === "stretch";

	var crossTotal = crossStart + "Total";
	var lineCrossSize;

	if (isStretch && isNotFlexWrap) {
		items = values.items;
		lineRemainder = values.container[crossSize] / lines.length;

		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;

			for (k = 0; k < l; k++) {
				item = items[k];

				if (item.debug.auto[crossSize]) {
					if (i) {
						item[crossStart] += (lineRemainder - item[crossSize]) * i;
					}

					item[crossSize] = (lineRemainder - item.debug.inner[crossStart]) - item.debug.margin[crossTotal];
				}
			}
		}
	} else if (isStretch) {
		for (i = 0, j = lines.length; i < j; i++) {
			line = lines[i];
			items = line.items;
			l = items.length;

			lineCrossSize = 0;

			for (k = 0; k < l; k++) {
				item = items[k];

				if (item.debug.auto[crossSize]) {
					lineCrossSize = Math.max(lineCrossSize, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
				}
			}

			for (k = 0; k < l; k++) {
				item = items[k];

				if (item.debug.auto[crossSize]) {
					item[crossSize] = (lineCrossSize - item.debug.inner[crossStart]) - item.debug.margin[crossTotal];
				}
			}
		}
	}

	var remainderSize = containerSize;

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];
		items = line.items;
		l = items.length;

		for (k = 0; k < l; k++) {
			item = items[k];
			line.maxItemSize = Math.max(line.maxItemSize || 0, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
		}

		remainderSize -= line.maxItemSize;
	}

	remainderSize /= lines.length;

	if (isStretch || isStart || isBaseline) {
		return;
	}

	if (isCenter) {
		multiplier = 0.5;
		remainderSize *= 0.5;
	}

	if (!isNotFlexWrap && !isAlignContentStretch) {
		remainderSize = 0;
	}

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];
		items = line.items;
		l = items.length;
		lineRemainder = line.maxItemSize;

		for (k = 0; k < l; k++) {
			item = items[k];

			// Remove margin from crossStart
			item[crossStart] -= item.debug.margin[crossTotal] * multiplier;
			item[crossStart] += remainderSize + (lineRemainder - (item[crossSize] + item.debug.inner[crossStart])) * multiplier;
		}
	}*/
};
