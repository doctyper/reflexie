Flexbox.models.alignItems = function (alignment, properties) {
	var crossStart = this.crossStart,
		crossSize = this.crossSize,
		lines = this.lines;

	// Figure out remainders & max item sizes
	var values = this.values;
	var mainSize = this.mainSize;
	var containerSize = values.container[mainSize];

	var crossTotal = crossStart + "Total";
	var isNotFlexWrap = properties["flex-wrap"] === "nowrap";

	var remainderSize = containerSize;
	var i, j, k, l, line, item;

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];

		for (k = 0, l = line.items.length; k < l; k++) {
			item = line.items[k];
			line.maxItemSize = Math.max(line.maxItemSize || 0, (item[crossSize] + item.debug.inner[crossStart]) + item.debug.margin[crossTotal]);
		}

		remainderSize -= line.maxItemSize;
	}

	// Divide equally
	remainderSize /= lines.length;

	// Expose remainderSize
	this.remainderSize = isNotFlexWrap ? remainderSize : Math.max(0, remainderSize);
};
