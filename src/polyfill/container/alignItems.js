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

	var isStretch = (alignment === "stretch");
	var isStart = (alignment === "flex-start");
	var isBaseline = (alignment === "baseline");
	var isCenter = (alignment === "center");

	var isNotFlexWrap = properties["flex-wrap"] === "nowrap";
	var isAlignContentStretch = properties["align-content"] === "stretch";

	var crossTotal = crossStart + "Total";

	for (i = 0, j = lines.length; i < j; i++) {
		line = lines[i];
		l = line.items.length;

		for (k = 0; k < l; k++) {
			item = line.items[k];
			line.maxItemSize = Math.max(line.maxItemSize || 0, item[crossSize] + item.debug.padding[crossTotal] + item.debug.border[crossTotal] + item.debug.margin[crossTotal]);

			var itemAlign = item.debug.properties["align-self"];

			if(!itemAlign || itemAlign === "auto") {
				item.debug.properties["align-self"] = alignment;
			}
		}
	}
};
