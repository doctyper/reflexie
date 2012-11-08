Flexbox.utils = {
	assert : function (prop, values) {
		var i, j, isValue = false;

		for (i = 0, j = values.length; i < j; i++) {
			if (prop === values[i]) {
				isValue = true;
				break;
			}
		}

		return isValue;
	},

	toCamelCase : function (str) {
		return str.replace(/\W+(.)/g, function (x, chr) {
			return chr.toUpperCase();
		});
	},

	testValue : function (val) {
		var dimensions = ["left", "top", "right", "bottom", "width", "height"],
			i, j;

		for (i = 0, j = dimensions.length; i < j; i++) {
			if (dimensions[i] === val) {
				return true;
			}
		}

		return false;
	},

	JSONToStyles : function (selector, styles) {
		var rules = [selector + " {"];
		var value, isDimension;

		for (var key in styles) {
			value = styles[key];
			isDimension = this.testValue(key);

			if (isDimension && typeof value === "number") {
				value = value.toString() + "px";
			}

			rules.push(key + ": " + value + ";");
		}

		rules = "\n" + rules.join("\n\t") + "\n}" + "\n";
		return rules;
	},

	removeStyles : function (id) {
		var existing = document.getElementById(id);

		if (existing) {
			existing.parentNode.removeChild(existing);
		}
	},

	applyStyles : function (id, selector, styles) {
		var css = this.JSONToStyles(selector, styles),
			head = document.getElementsByTagName("head")[0],
			existing = document.getElementById(id),
			style = existing || document.createElement("style");

		if (!existing) {
			style.id = id;
			style.type = "text/css";
		}

		// console.log(css);

		if (style.styleSheet) {
			style.styleSheet.cssText += css;
		} else {
			style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}
};
