{
	"target": {
		"property": "display",
		"values": ["flex", "inline-flex"],
		"initial": "flex"
	},

	"container": {
		"properties": [{
			"property": "flex-direction",
			"values": ["row", "row-reverse", "column", "column-reverse"],
			"initial": "row",
			"inherited": false,
			"dependencies": {
				"childNodes": 3
			}
		}, {
			"property": "flex-wrap",
			"values": ["nowrap", "wrap", "wrap-reverse"],
			"initial": "nowrap",
			"inherited": false,
			"dependencies": {
				"childNodes": 6
			}
		}, {
			"property": "justify-content",
			"values": ["flex-start", "flex-end", "center", "space-between", "space-around"],
			"initial": "flex-start",
			"inherited": false,
			"dependencies": {
				"childNodes": 3
			}
		}, {
			"property": "align-items",
			"values": ["flex-start", "flex-end", "center", "baseline", "stretch"],
			"initial": "stretch",
			"inherited": false,
			"dependencies": {
				"childNodes": 3,
				"map": {
					"stretch": {
						"size": "auto"
					}
				}
			}
		}, {
			"property": "align-content",
			"values": ["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"],
			"initial": "stretch",
			"inherited": false,
			"dependencies": {
				"childNodes": 6,
				"properties": {
					"flex-wrap": "wrap"
				},
				"map": {
					"stretch": {
						"size": "auto"
					}
				}
			}
		}],

		"shorthands": [{
			"property": "flex-flow",
			"shorthand": true,
			"values": ["<flex-direction>", "<flex-wrap>"]
		}]
	},

	"items": {
		"properties": [{
			"property": "align-self",
			"values": ["auto", "flex-start", "flex-end", "center", "baseline", "stretch"],
			"initial": "auto",
			"inherited": false
		}, {
			"property": "order",
			"values": ["<number>"],
			"initial": 0,
			"inherited": false
		}, {
			"property": "flex-grow",
			"values": ["<number>"],
			"initial": 0,
			"inherited": false
		}, {
			"property": "flex-shrink",
			"values": ["<number>"],
			"initial": 1,
			"inherited": false
		}, {
			"property": "flex-basis",
			"values": ["<width>"],
			"initial": "auto",
			"inherited": false
		}],

		"shorthands": [{
			"property": "flex",
			"shorthand": true,
			"values": ["<flex-grow>", "<flex-shrink>", "<flex-basis>"]
		}]
	}
}
