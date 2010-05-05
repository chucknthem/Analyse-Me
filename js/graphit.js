var Graphit = {
	/*
	 * graph the data on a canvas
	 */
	bargraph: function(data, canvas_id, err_call) {
		var canvas = document.getElementById(canvas_id);
		if(!canvas_id) {
			err_call('invalid canvas_id');
		}
		var names = data['names'];
		var values = data['values'];
		if (typeof(names) == 'undefined' || names.length == 0) {
			if(err_call) {
				err_call("no data yet, browse a few websites and try again in a few minutes");
            return;
         }
		}
		var max = names[0].length;
		for (i=1;i<names.length;i++) {
			if (names[i].length > max) {
				max = names[i].length;
			}
		}
		//clear context
		canvas.width = canvas.width;
		var size = max*3;

		canvas.width = 400 + size*4;
		canvas.style.setProperty("margin-top", size);
		canvas.style.setProperty("margin-bottom", size);

		var bar = new RGraph.HBar(canvas.id, [values]);
		bar.Set('chart.labels', names);
		bar.Set('chart.gutter', size);
		bar.Set('chart.background.barcolor1', 'rgba(255,255,255,1)');
		bar.Set('chart.background.barcolor2', 'rgba(255,255,255,1)');
		bar.Set('chart.title', 'Top 10 domains vs time spent(in minutes)');
		bar.Set('chart.background.grid', true);
		bar.Set('chart.colors', ['red', 'orange','yellow','green','blue','purple','black','cyan','Chocolate','Magenta']);
		bar.Draw();
	}
};
