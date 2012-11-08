Flexbox.container = (function () {
	var utils = Flexbox.utils;
	var models = Flexbox.models;

	Flexbox.dimValues = {
		"left": "width",
		"top": "height"
	};

	Flexbox.applyPositioning = function (id, container, items, values) {
		var rects = values.items,
			box = values.container,
			i, j, key, rect, item, element;

		utils.applyStyles(id, container.selector, {
			"position": "relative",
			"width": box.width,
			"height": box.height
		});

		for (i = 0, j = items.length; i < j; i++) {
			item = items[i];
			rect = rects[i];

			utils.applyStyles(id, item.selector, rect);
		}
	};

	Flexbox.getPristineBox = function (element, position) {
		position = position || "absolute";
		var box = element.getBoundingClientRect();

		return {
			position: position,
			left: box.left,
			top: box.top,
			width: box.width,
			height: box.height
		};
	};

	Flexbox.storePositionValues = function (container, items) {
		var i, j;
		var box = Flexbox.getPristineBox(container.element, "relative");
		var children = [];

		for (i = 0, j = items.length; i < j; i++) {
			children.push(Flexbox.getPristineBox(items[i].element));
		}

		return {
			container: box,
			items: children
		};
	};

	Flexbox.clonePositionValues = function (values) {
		var key, i, j, newItem;

		var newValues = {
			container: {},
			items: []
		};

		for (key in values.container) {
			newValues.container[key] = values.container[key];
		}

		for (i = 0, j = values.items.length; i < j; i++) {
			newItem = {};

			for (key in values.items[i]) {
				newItem[key] = values.items[i][key];
			}

			newValues.items.push(newItem);
		}

		return newValues;
	};

	var Container = function (settings) {
		this.settings = settings;
		return this.render(settings);
	};

	Container.prototype = {
		model : {
			flexDirection : models.flexDirection,
			flexWrap : models.flexWrap,
			justifyContent : models.justifyContent,
			alignItems : models.alignItems,
			alignContent : models.alignContent
		},

		generateUID : function (container) {
			if (this.uid) {
				return this.uid;
			}

			var selector = container.selector;
			selector = selector.replace(/\#/g, "id-");
			selector = selector.replace(/\./g, "class-");
			selector = selector.replace(/\:/g, "pseudo-");
			selector = selector.replace(/\s/g, "-");

			this.uid = "flexie-" + selector;
			return this.uid;
		},

		render : function (settings) {
			this.uid = this.generateUID(settings.container);

			// Clean DOM, remove pre-existing styles
			utils.removeStyles(this.uid);

			this.container = settings.container;
			this.items = settings.items;

			this.dom = this.dom || {};
			this.dom.values = Flexbox.storePositionValues(this.container, this.items);
			this.values = Flexbox.clonePositionValues(this.dom.values);

			var properties = this.container.properties;
			var model = this.model;

			/*for (var key in properties) {
				var func = utils.toCamelCase(key);

				if (model[func]) {
					model[func].call(this, properties[key], properties);
				}
			}*/
			this.model.flexDirection.call(this, properties["flex-direction"], properties);
			this.model.flexWrap.call(this, properties["flex-wrap"], properties);

			Flexbox.applyPositioning(this.uid, this.container, this.items, this.values);
		}
	};

	return Container;

}());
