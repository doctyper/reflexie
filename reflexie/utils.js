define(function (utils) {
	"use strict";

	/*jshint browser:true*/

	var Utils = {
		mapItems : function (items) {
			var i, j, domItems = [];

			for (i = 0, j = items.length; i < j; i++) {
				domItems.push(items[i].element);
			}

			return domItems;
		},

		cleanWhitespace: function (node) {
			var i, child;

			for (i = 0; i < node.childNodes.length; i++) {
				child = node.childNodes[i];

				if (child.nodeType === 3 && !(/\S/.test(child.nodeValue))) {
					node.removeChild(child);
					i--;
				}

				if (child.nodeType === 1) {
					this.cleanWhitespace(child);
				}
			}

			return node;
		}
	};

	return Utils;

});
