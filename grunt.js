/*jshint node:true*/

module.exports = function (grunt) {

	"use strict";

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

				/*!
				 * domready (c) Dustin Diaz 2012 - License MIT
				 */
				"lib/domready/domready",

				/* https://github.com/keeganstreet/specificity */
				/* License TBD */
				"lib/specificity/specificity",

				"src/core",
				"src/utils",
				"src/support",
				"src/parser",
				"src/polyfill/items/order",
				"src/polyfill/items/alignSelf",
				"src/polyfill/container/flexDirection",
				"src/polyfill/container/flexWrap",
				"src/polyfill/container/justifyContent",
				"src/polyfill/container/alignItems",
				"src/polyfill/container/alignContent",
				"src/polyfill/container",
				"src/polyfill/items",
				"src/polyfill",
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
	});

};
