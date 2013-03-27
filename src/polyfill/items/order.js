Flexbox.models.order = function () {
	this.items.sort(function (a, b) {
		var aProps = a.properties;
		var bProps = b.properties;

		if (!aProps || !bProps) {
			return;
		}

		return aProps.order - bProps.order;
	});

	this.values.items.sort(function (a, b) {
		var aProps = a.debug.properties;
		var bProps = b.debug.properties;

		if (!aProps || !bProps) {
			return;
		}

		return aProps.order - bProps.order;
	});
};
