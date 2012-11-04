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
			"inherited": false
		}, {
			"property": "flex-wrap",
			"values": ["nowrap", "wrap", "wrap-reverse"],
			"initial": "nowrap",
			"inherited": false
		}, {
			"property": "justify-content",
			"values": ["flex-start", "flex-end", "center", "space-between", "space-around"],
			"initial": "flex-start",
			"inherited": false
		}, {
			"property": "align-items",
			"values": ["flex-start", "flex-end", "center", "baseline", "stretch"],
			"initial": "stretch",
			"inherited": false
		}, {
			"property": "align-self",
			"values": ["auto", "flex-start", "flex-end", "center", "baseline", "stretch"],
			"initial": "auto",
			"inherited": false
		}, {
			"property": "align-content",
			"values": ["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"],
			"initial": "stretch",
			"inherited": false
		}],

		"shorthands": [{
			"property": "flex-flow",
			"shorthand": true,
			"values": ["<flex-direction>", "<flex-wrap>"]
		}]
	},

	"items": {
		"properties": [{
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
			"initial": 0,
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
