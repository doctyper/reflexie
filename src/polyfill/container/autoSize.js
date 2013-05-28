Flexbox.models.autoSize = function (size, properties) {
	var values = this.values,
		container = values.container,
		itemValues = values.items,
		i, j, item,
		mainStart = this.mainStart,
		mainSize = this.mainSize,
		crossSize = this.crossSize,
		isNotFlexWrap = properties["flex-wrap"] === "nowrap";

	if (isNotFlexWrap) {
		var totalMainSize = 0,
			currMainDiff = 0,
			mainDiff, element, min, padding, border;

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];
			mainDiff = 0;

			if (!item.debug.auto[mainSize]) {
				continue;
			}

			element = this.items[i].element;

			min = Flexbox.utils.getMin(element, mainSize);
			padding = item.debug.padding;
			border = item.debug.border;

			var currMainSize = item[mainSize];

			var minMainSize = min[mainSize] - (padding.left + padding.right) - (border.left + border.right);
			var minCrossSize = min[crossSize] - (padding.top + padding.bottom) - (border.top + border.bottom);

			item[mainSize] = minMainSize;
			item[crossSize] = minCrossSize;

			if (itemValues[i + 1]) {
				mainDiff = currMainDiff + currMainSize - minMainSize;
				itemValues[i + 1][mainStart] -= mainDiff;
			}

			currMainDiff += mainDiff;
			totalMainSize += minMainSize;
		}
	}
};
