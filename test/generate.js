/*jshint node:true*/

"use strict";

var fs = require("fs");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

server.listen(9999);

io.configure(function () {
	io.set("log level", 1);
});

io.sockets.on("connection", function (socket) {
	var css = __dirname + "/css/runner.css";
	var data = __dirname + "/data/flex-properties.js";

	fs.watchFile(css, function (curr, prev) {
		socket.emit("csschange");
	});

	fs.watchFile(data, function (curr, prev) {
		socket.emit("datachange");
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
	var file = fs.readFileSync(__dirname + "/data/flex-properties.js");
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
