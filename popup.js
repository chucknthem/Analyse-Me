bar = {};

var graphit = function (names,values) {

	document.getElementById('overallUsage').width = document.getElementById('overallUsage').width;

	max = names[0].length;
	for (i=1;i<names.length;i++) {
		if (names[i].length > max) {
			max = names[i].length;
		}
	}
	
	var size = max*2.5;
	
	document.getElementById('overallUsage').height = 300 + 2*size;
	document.getElementById('overallUsage').width = 400 + size*4;
	document.getElementById('overallUsage').style.cssText = "margin-top:-"+size+"px; margin-bottom:-"+size+"px; margin-right:-"+size*2+"px;";
	document.body.height=310;
	
	bar = new RGraph.HBar('overallUsage', values);
	bar.Set('chart.labels', names);
	bar.Set('chart.gutter', size);
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