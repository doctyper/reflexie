Flexbox.models.alignSelf = function (alignment, properties) {
	var crossStart = this.crossStart,
		crossSize = this.crossSize,
		multiplier = 1,
		lines = this.lines,
		i, j, ilim, jlim, k, l, line, items, item,
		lineRemainder;

	var values = this.values;
	var mainSize = this.mainSize;
	var containerSize = values.container[mainSize];

	var mainStart = this.mainStart;
	var crossTotal = crossStart + "Total";

	var isNotFlexWrap = properties["flex-wrap"] === "nowrap";

	var alignSelf, lineSize;
	var isAuto, isStart, isEnd, isCenter, isStretch;

	var runningLineTotal = values.container.debug.padding[crossStart];

	for (i = 0, ilim = lines.length; i < ilim; i++) {
		line = lines[i];

		for (j = 0, jlim = line.items.length; j < jlim; j++) {
			item = line.items[j];

			if (!item.debug || !item.debug.properties) {
				return;
			}

			alignSelf = item.debug.properties["align-self"];

			isAuto = alignSelf === "auto";
			isStart = alignSelf === "flex-start";
			isEnd = alignSelf === "flex-end";
			isCenter = alignSelf === "center";
			isStretch = alignSelf === "stretch";

			lineSize = (isNotFlexWrap) ? containerSize : line.maxItemSize;

			if (isStretch) {
				if (item.debug.auto[crossSize]) {
					item[crossStart] = runningLineTotal;
					item[crossSize] = lineSize - item.debug.padding[crossTotal] - item.debug.border[crossTotal] - item.debug.margin[crossTotal];
				}
			} else if (isStart) {
				item[crossStart] = runningLineTotal;
			} else if (isEnd) {
				item[crossStart] = runningLineTotal + lineSize - item[crossSize] - item.debug.padding[crossTotal] - item.debug.border[crossTotal] - item.debug.margin[crossTotal];
			} else if (isCenter) {
				item[crossStart] = runningLineTotal + 0.5*(lineSize - item[crossSize] - item.debug.padding[crossTotal] - item.debug.border[crossTotal] - item.debug.margin[crossTotal]);
			}
		}

		runningLineTotal += line.maxItemSize;
	}
};
