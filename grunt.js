/*jshint node:true*/

module.exports = function (grunt) {

	"use strict";

	grunt.initConfig({
		pkg: "<json:package.json>",
		build: {
			"dist/reflexie.js": [
				"intro",
				"core",
				"utils",
				"support",
				"parser",
				"polyfill/container/flexDirection",
				"polyfill/container/flexWrap",
				"polyfill/container/justifyContent",
				"polyfill/container/alignItems",
				"polyfill/container/alignContent",
				"polyfill/container",
				"polyfill/items",
				"polyfill",
				"exports",
				"outro"
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
			filepath = "src/" + filepath + ".js";

			source = grunt.file.read(filepath);

			if (!(/(in|ou)tro\.js$/).test(filepath)) {
				source = ("\n" + source).replace(/\n/gm, "\n\t").replace(/\n\t\n/gm, "\n\n");
			}

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
