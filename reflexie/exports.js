// Uses AMD or browser globals to create a module.
if (typeof define === "function" && define.amd) {
	define(function () {
		return Flexie;
	});
} else {
	window.Flexie = Flexie;
}
