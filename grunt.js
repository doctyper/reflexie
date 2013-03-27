/*jshint node:true*/

module.exports = function (grunt) {

	"use strict";

	var getBytesWithUnit = function (bytes) {
		if (isNaN(bytes)) {
			return;
		}

		var units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		var amountOf2s = Math.floor(Math.log(+bytes) / Math.log(2));

		if (amountOf2s < 1) {
			amountOf2s = 0;
		}

		var i = Math.floor(amountOf2s / 10);
		bytes = +bytes / Math.pow(2, 10 * i);

		// Rounds to 3 decimals places.
		if (bytes.toString().length > bytes.toFixed(3).toString().length) {
			bytes = bytes.toFixed(3);
		}

		return bytes + units[i];
	};

	grunt.initConfig({
		pkg: "<json:package.json>",
		build: {
			"dist/reflexie.js": [
				"src/intro",

				// Via https://github.com/adobe-webplatform/css-regions-polyfill
				/*!
				Copyright 2012 Adobe Systems Inc.;
				Licensed under the Apache License, Version 2.0 (the "License");
				you may not use this file except in compliance with the License.
				You may obtain a copy of the License at

				http://www.apache.org/licenses/LICENSE-2.0

				Unless required by applicable law or agreed to in writing, software
				distributed under the License is distributed on an "AS IS" BASIS,
				WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				See the License for the specific language governing permissions and
				limitations under the License.
				*/
				"lib/css-regions-polyfill/src/shims",
				"lib/css-regions-polyfill/src/StyleLoader",
				"lib/css-regions-polyfill/src/cssparser",

				/* https://github.com/jeromeetienne/microevent.js */
				/* License MIT */
				"lib/microevent/microevent",

				/* https://github.com/keeganstreet/specificity */
				/* License TBD */
				"lib/specificity/specificity",

				"src/core",
				"src/utils",
				"src/parser",
				"src/polyfill/items/order",
				"src/polyfill/items/alignSelf",
				"src/polyfill/items/flexGrow",
				"src/polyfill/container/flexDirection",
				"src/polyfill/container/flexWrap",
				"src/polyfill/container/justifyContent",
				"src/polyfill/container/alignItems",
				"src/polyfill/container/alignContent",
				"src/polyfill/container",
				"src/polyfill/items",
				"src/polyfill",
				"src/support",
				"src/event",
				"src/init",
				"src/exports",
				"src/outro"
			]
		},

		watch: {
			files: ["src/**/*.js"],
			tasks: "build"
		}
	});

	// Special concat/build task to handle various jQuery build requirements
	//
	grunt.registerMultiTask("build", "Concatenate source", function () {
		var done = this.async();

		// Concat specified files.
		var compiled = "",
			version = grunt.config("pkg.version"),
			source;

		// conditionally concatenate source
		this.file.src.forEach(function (filepath) {
			filepath += ".js";

			source = grunt.file.read(filepath);

			if (!(/(in|ou)tro\.js$/).test(filepath)) {
				source = ("\n" + source).replace(/\n/gm, "\n\t").replace(/\n\t\n/gm, "\n\n");
			}

			// Formatting

			// spaces -> tabs
			source = source.replace(/    /g, "\t");

			// trim whitespace
			source = source.replace(/\s+\n/g, "\n\n");

			compiled += source;
			grunt.log.ok(filepath);
		});

		// Embed Version
		// Embed Date
		compiled = compiled.replace(/@VERSION/g, version)
		.replace("@DATE", function () {
			var date = new Date();

			// YYYY-MM-DD
			return [
				date.getMonth() + 1,
				date.getDate(),
				date.getFullYear()
			].join("-");
		});

		// Write concatenated source to file
		grunt.file.write(this.file.dest, compiled);
		grunt.log.subhead("Saved output to " + this.file.dest);

		var uglify = require("uglify-js2");
		var result = uglify.minify(this.file.dest, {
			outSourceMap: this.file.dest + ".map",
			warnings: true,
			mangle: true,
			compress: {
				unsafe: true
			}
		});

		var minifiedPath = this.file.dest.replace(".js", ".min.js");

		// Save minified file
		grunt.file.write(minifiedPath, result.code);

		// Save source map
		grunt.file.write(this.file.dest + ".map", result.map);

		var gzip = require("gzip");

		gzip(result.code, function (err, data) {
			grunt.log.ok(getBytesWithUnit(compiled.length) + " uncompressed");
			grunt.log.ok(getBytesWithUnit(result.code.length) + " minified");
			grunt.log.ok(getBytesWithUnit(data.length) + " min & gzipped");

			done();
		});
	});

};
