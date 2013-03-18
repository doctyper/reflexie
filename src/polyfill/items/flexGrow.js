Flexbox.models.flexGrow = function (properties) {
	// Check for space, otherwise exit
	var values = this.values,
		container = values.container,

		crossStart = this.crossStart,
		mainStart = this.mainStart,

		mainSize = this.mainSize,
		crossSize = this.crossSize,

		containerMainSize = container[mainSize],
		containerCrossSize = container[crossSize],
		lines = this.lines,

		i, j, key;

		// TODO Properly: Determine the available main and cross space for the flex items (9.2)
		// Currently just using containerSize
		for(key in lines)
			console.log(lines[key]);

		console.log(mainSize, crossSize, containerMainSize);
};