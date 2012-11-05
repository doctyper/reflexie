define([
	"../utils"
], function (utils) {

	var colArray = ["column", "column-reverse"];
	var revArray = ["row-reverse", "column-reverse"];

	var revValues = {
		"left": "right",
		"top": "bottom"
	};

	var dimValues = {
		"left": "width",
		"top": "height"
	};

	var Container = function (settings) {
		this.settings = settings;
		return this.render(settings);
	};

	Container.prototype = {
		storePositionValues : function (container, items) {
			var i, j, items, storedVal, incrementVal = 0,
				properties = container.properties,
				direction = properties["flex-direction"],
				isColumn = utils.assert(direction, colArray),
				isReverse = utils.assert(direction, revArray),
				aVal = (isColumn ? "left" : "top"),
				bVal = (isColumn ? "top" : "left"),
				revVal = revValues[bVal],
				dimVal = dimValues[bVal],
				rects = [], box, obj;

			for (i = 0, j = items.length; i < j; i++) {
				item = items[i].element;
				box = item.getBoundingClientRect();

				if (i === 0) {
					storedVal = box[aVal];
				}

				obj = {};

				obj.position = "absolute";
				obj[aVal] = storedVal;
				obj[bVal] = box[bVal] + incrementVal;

				if (isReverse) {
					obj[revVal] = obj[bVal];
					delete obj[bVal];
				}

				rects.push(obj);

				if (!isColumn) {
					incrementVal += box[dimVal];
				}
			}

			return rects;
		},

		applyPositioning : function (container, items, rects) {
			var i, j, items, key, rect, element, box;

			element = container.element;
			box = element.getBoundingClientRect();

			element.style.position = "relative";
			element.style.width = box.width;
			element.style.height = box.height;

			for (i = 0, j = items.length; i < j; i++) {
				item = items[i].element;
				rect = rects[i];

				for (key in rect) {
					item.style[key] = rect[key];
				}
			}

			return items;
		},

		setDisplay : function () {
			var container = this.container,
				properties = container.properties,
				items = this.items,
				rects = this.storePositionValues(container, items);

			this.applyPositioning(container, items, rects);
		},

		render : function (settings) {
			this.container = settings.container;
			this.items = settings.items;

			this.setDisplay();
		}
	};

	return Container;

});
