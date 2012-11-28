Flexbox.models.alignSelf = function (alignment, properties) {
	var crossStart = this.crossStart,
		crossSize = this.crossSize,
		multiplier = 1,
		lines = this.lines,
		i, j, k, l, line, items, item,
		lineRemainder;

	var values = this.values;
	var mainSize = this.mainSize;
	var containerSize = values.container[mainSize];

	var mainStart = this.mainStart;
	var crossTotal = crossStart + "Total";

	var isNotFlexWrap = properties["flex-wrap"] === "nowrap";

	var alignSelf, lineSize;
	var isAuto, isStart, isCenter, isStretch;

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];

		for (i = 0, j = line.items.length; i < j; i++) {
			item = line.items[i];

			alignSelf = item.debug.properties["align-self"];

			isAuto = alignSelf === "auto";
			isStart = alignSelf === "flex-start";
			isCenter = alignSelf === "center";
			isStretch = alignSelf === "stretch";

			lineSize = (isNotFlexWrap) ? containerSize : line.maxItemSize;
			lineSize -= item.debug.inner[crossStart];
			lineSize -= item.debug.margin[crossTotal];

			if (isStretch) {
				if (item.debug.auto[crossSize]) {
					item[crossSize] = lineSize;
				}
			} else if (!isAuto && !isStart) {
				if (isCenter) {
					multiplier = 0.5;
				}

				item[crossStart] += (lineSize - item[crossSize]) * multiplier;
			}
		}
	}
};
