/*jshint node:true*/

"use strict";

var fs = require("fs");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

server.listen(9999);

io.configure(function () {
	io.set("log level", 2);

	var css = __dirname + "/css/runner.css";
	var data = __dirname + "/data/pairwise/flex-tests.js";
	var generate = __dirname + "/views/generate.html";
	var test = __dirname + "/lib/tests.js";
	var src = __dirname + "/../dist/reflexie.js";

	fs.watchFile(css, function (curr, prev) {
		io.sockets.emit("csschange");
	});

	fs.watchFile(data, function (curr, prev) {
		io.sockets.emit("testchange");
	});

	fs.watchFile(generate, function (curr, prev) {
		io.sockets.emit("testchange");
	});

	fs.watchFile(test, function (curr, prev) {
		io.sockets.emit("datachange");
	});

	fs.watchFile(src, function () {
		console.log("srcchange");
		io.sockets.emit("srcchange");
	});
});

io.sockets.on("connection", function (socket) {
	socket.on("suiteerror", function (data) {
		var map = {};

		var parent = data.parent;
		var items = data.items;

		var dataPath = __dirname + "/data";
		var failCSSFile = dataPath + "/fail.css";
		var failJSFile = dataPath + "/fail.js";

		var toPrettyCSS = function (string) {
			var match = (/(\#[\w-]+) { (.*)+; }/).exec(string);
			var newString = "";

			if (match && match[2]) {
				newString += match[1] + " {\n\t";

				var prefixes = ["-webkit-", ""];
				var rules = match[2].split(/;\s?/);

				for (var i = 0, j = rules.length; i < j; i++) {
					var rule = rules[i].split(/:\s?/);

					for (var k = 0, l = prefixes.length; k < l; k++) {
						if (rule[0] === "main-size") {
							continue;
						}

						if (rule[0] === "display") {
							newString += rule[0] + ": " + prefixes[k] + rule[1];
						} else {
							newString += prefixes[k] + rule[0] + ": " + rule[1];
						}

						newString += ";\n\t";
					}

					if (rules[i + 1]) {
						newString += "\n\t";
					}
				}

				newString += "}\n";
			}

			// string = string.replace(/\{\s?/g, "{\n\t");
			// string = string.replace(/;\s?/g, ";\n\t");
			// string = string.replace(/\s?\}/g, "}\n");

			return newString;
		};

		var formatCSS = function (parent, items) {
			parent = toPrettyCSS(parent);
			return parent + "\n" + items.map(function (item) {
				return toPrettyCSS(item);
			}).join("\n");
		};

		var toJSON = function (string) {
			var match = (/\#(?:[\w-]+) { (.*)+; }/).exec(string);
			var map = {};

			if (match && match[1]) {
				var rules = match[1].split(/;\s?/);

				for (var i = 0, j = rules.length; i < j; i++) {
					var rule = rules[i].split(/:\s?/);
					map[rule[0]] = rule[1];
				}
			}

			return JSON.stringify(map, null, "\t\t").replace(/\}/g, "\t}");
		};

		var formatJS = function (parent, items) {
			return "window.flexValues = {\n\t\"container\": " + toJSON(parent) + ",\n\t\"items\": [" + (function () {
				var arr = [];

				for (var i = 0, j = items.length; i < j; i++) {
					arr.push(toJSON(items[i]));
				}

				return arr.join(", ");
			}()) + "]\n};\n";
		};

		var css = formatCSS(parent, items);
		var js = formatJS(parent, items);

		fs.writeFileSync(failCSSFile, css);
		fs.writeFileSync(failJSFile, js);

		console.log("New error reported. Check http://0.0.0.0:9090/tester for details.");
		io.sockets.emit("errorchange");
	});
});

app.configure(function () {
	app.use(express.bodyParser());
	app.use("/css", express.static(__dirname + "/css"));
	app.use("/lib", express.static(__dirname + "/lib"));
	app.use("/data", express.static(__dirname + "/data"));
	app.use("/dist", express.static(__dirname + "../../dist"));

	app.set("views", __dirname + "/views");
	app.engine("html", require("ejs").renderFile);
});

app.get("/properties", function (req, res) {
	var file = fs.readFileSync(__dirname + "/data/pairwise/flex-tests.js");
	res.json(JSON.parse(file));
});

app.get("/generate", function (req, res) {
	res.render("generate.html");
});

app.get("/runner", function (req, res) {
	res.render("runner.html");
});

app.get("/tester", function (req, res) {
	res.render("tester.html");
});

app.post("/flex", function (req, res) {
	var dataPath = __dirname + "/data";
	var dataFile = dataPath + "/flex.js";

	if (!fs.existsSync(dataPath)) {
		fs.mkdirSync(dataPath);
	}

	var json = JSON.stringify(req.body, null, "\t");
	fs.writeFileSync(dataFile, json);

	io.sockets.emit("datachange");
	res.send("Success!");
});

app.listen(9090);
console.log("listening to http://0.0.0.0:9090");

// var cp = require("child_process");
// var child = cp.spawn("open", [
	// "-a", "/Applications/Google Chrome.app",
	// "http://0.0.0.0:9090/generate"
// ]);
