define(function (utils) {
	"use strict";

	/*jshint browser:true*/

	var Utils = {
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
		}
	};

	return Utils;

});
