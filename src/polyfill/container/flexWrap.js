Flexbox.models.flexWrap = function (wrap, properties) {
	var values = this.values;
	var itemValues = values.items;

	var i, j;

	var isWrap = (wrap === "wrap");
	var isWrapReverse = (wrap === "wrap-reverse");

	var crossStart = this.crossStart;
	var mainStart = this.mainStart;

	var mainSize = this.mainSize;
	var crossSize = this.crossSize;

	var containerSize = values.container[mainSize];
	var lines = [];

	var line = {
		items: []
	};

	var utils = Flexbox.utils,
		revArray = ["row-reverse", "column-reverse"],
		isReverse = utils.assert(properties["flex-direction"], revArray);

	// TODO: Implement `flex-wrap: wrap-reverse;`
	if (isWrap || isWrapReverse) {
		var breakPoint = containerSize;
		var item;

		var currMainStart = 0;
		var prevMainStart = 0;
		var currCrossStart = 0;
		var prevCrossStart = 0;

		var multiplier = isReverse ? -1 : 1;

		for (i = 0, j = itemValues.length; i < j; i++) {
			item = itemValues[i];

			if (currMainStart + item[mainSize] > breakPoint) {
				lines.push(line);

				line = {
					items: []
				};

				prevMainStart += currMainStart;
				prevCrossStart += currCrossStart;

				currMainStart = 0;
				currCrossStart = 0;
			}

			item[mainStart] -= prevMainStart * multiplier;
			item[crossStart] += prevCrossStart;

			currMainStart += item[mainSize];
			currCrossStart = Math.max(currCrossStart, item[crossSize]);

			line.items.push(item);
		}
	} else {
		line.items = values.items;
	}

	lines.push(line);

	// Expose lines
	this.lines = lines;
};
