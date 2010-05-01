bar = {};
line = {};

graphit = function (names,values,data1) {

	document.getElementById('overallUsage').width = document.getElementById('overallUsage').width;
	document.getElementById('hourUsage').width = document.getElementById('hourUsage').width;
	
	
	bar = new RGraph.HBar('overallUsage', values);
	bar.Set('chart.labels', names);
	bar.Set('chart.gutter', 45);
	bar.Set('chart.background.barcolor1', 'rgba(255,255,255,1)');
	bar.Set('chart.background.barcolor2', 'rgba(255,255,255,1)');
	bar.Set('chart.background.grid', true);
	bar.Set('chart.colors', ['red', 'orange','yellow','green','blue','purple','black','cyan','Chocolate','Magenta']);
		
	bar.Draw();


	line = new RGraph.Line("hourUsage", data1[0], data1[1], data1[2], data1[3], data1[4], data1[5], data1[6], data1[7], data1[8], data1[9]);
	line.Set('chart.background.barcolor1', 'rgba(255,255,255,1)');
	line.Set('chart.background.barcolor2', 'rgba(255,255,255,1)');
	line.Set('chart.background.grid.color', 'rgba(238,238,238,1)');
	line.Set('chart.colors', ['red', 'orange','yellow','green','blue','purple','black','cyan','Chocolate','Magenta']);
	line.Set('chart.linewidth', 2);
	line.Set('chart.filled', false);
	line.Set('chart.hmargin', 5);
	line.Set('chart.labels', []);
	line.Set('chart.gutter', 40);
	line.Draw();
};

window.onload = function () {
	data1 = [];
	
	for (i=0;i<10;i++) {
		data1[i] = [];
		curr=i+10;
		for (a=0;a<100;a++) {
			curr = Math.random()*2-1+curr;
			if (curr < 0) {curr = 0;}
			data1[i][a] = curr;
		}
	}
	
	fetchBest(10, function (data) {
		graphit (data.hosts,[data.counts],data1);
	});
	
	//window.setTimeout ('graphit (["facebook.com","google.com.au","mail.google.com"],[[30,5,66]],data1);',1000);
	
}
