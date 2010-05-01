bar = {};

var graphit = function (names,values) {

	document.getElementById('overallUsage').width = document.getElementById('overallUsage').width;
	
	bar = new RGraph.HBar('overallUsage', values);
	bar.Set('chart.labels', names);
	bar.Set('chart.gutter', 60);
	bar.Set('chart.background.barcolor1', 'rgba(255,255,255,1)');
	bar.Set('chart.background.barcolor2', 'rgba(255,255,255,1)');
	bar.Set('chart.background.grid', true);
	bar.Set('chart.colors', ['red', 'orange','yellow','green','blue','purple','black','cyan','Chocolate','Magenta']);
		
	bar.Draw();

}

window.onload = function () {
	DB.fetchBest(10, function (data) {
		graphit (data.hosts,[data.counts]);
	});
	
	window.setInterval ('	DB.fetchBest(10, function (data) {graphit (data.hosts,[data.counts]);});;',10000);
};