Flexbox.models.order = function (properties) {
	this.items.sort(function (a, b) {
		return a.properties.order - b.properties.order;
	});

	this.values.items.sort(function (a, b) {
		return a.debug.properties.order - b.debug.properties.order;
	});
};
