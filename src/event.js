Flexbox.event = {
	handlers : {
		redraw : function () {
			var options = Flexie.options || {};

			if (typeof options.redraw === "function") {
				options.redraw.apply(Flexie, arguments);
			}
		},

		complete : function () {
			var options = Flexie.options || {};

			if (typeof options.complete === "function") {
				options.complete.apply(Flexie, arguments);
			}
		}
	},

	emitter: function () {
		var ee = new MicroEvent(),
			handlers = Flexbox.event.handlers;

		ee.bind("redraw", handlers.redraw);
		ee.bind("complete", handlers.complete);

		return ee;
	}
};
