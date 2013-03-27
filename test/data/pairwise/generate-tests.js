/*jshint node:true*/

(function () {
	"use strict";

	var fs = require("fs");
	var path = require("path");
	var cp = require("child_process");

	var pl = path.join(__dirname, "..", "..", "lib", "pairs", "allpairs.pl");
	var tsv = path.join(__dirname, "flex-properties.tsv");
	var js = path.join(__dirname, "flex-tests.js");

	var child = cp.exec(["perl", pl, tsv].join(" "), function (err, stdout, stderr) {
		if (stderr) {
			return process.exit(stderr);
		}

		var raw = stdout.toString().trim().split("PAIRING DETAILS\n");
		var cases = raw[0].trim();
		var details = raw[1].trim();

		console.log();
		console.log(cases);

		// return process.exit();

		// Tests array
		var tests = [];

		var lines = cases.split("\n");

		// Ignore buffer
		var buffer = lines.shift();

		// Grab titles
		var titles = lines.shift().split("\t");

		for (var i = 0, j = lines.length; i < j; i++) {
			var line = lines[i].split("\t");

			// Rule object
			var rule = {
				parent: {},
				items: new Array(3)
			};

			for (var k = 0, l = line.length; k < l; k++) {
				var prop = titles[k];
				var value = line[k];

				// Not using the optional identifier, so let's drop it.
				value = value.replace(/^\~/, "");

				switch (prop) {
				case "display":
				case "flex-direction":
				case "flex-wrap":
				case "justify-content":
				case "align-items":
				case "align-content":
					rule.parent[prop] = value;
					break;

				case "children":
					rule.children = value;
					break;

				default:
					var match = (/([a-z-]+)\-nth\-(\d)/).exec(prop);

					if (match && match.length) {
						var pristine = match[1];
						var idx = match[2] - 1;

						rule.items[idx] = rule.items[idx] || {};
						rule.items[idx][pristine] = value;
					}
					break;
				}
			}

			// Account for 6x children
			if (rule.children === "6") {
				rule.items = rule.items.concat(rule.items);
			}

			tests.push(rule);
		}

		if (fs.existsSync(js)) {
			fs.unlinkSync(js);
		}

		console.log();
		console.log("Success! Saved output to", js.replace(path.join(process.cwd(), "/"), ""));
		fs.writeFileSync(js, JSON.stringify(tests, null, "\t"));
	});
}());
