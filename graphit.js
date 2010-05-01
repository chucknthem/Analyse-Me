bar = {};

window.onload = function () {
	var data = [280,45,133,166,84,259,266,960,219,311];

	bar = new RGraph.HBar('myCanvas', data);
	bar.Set('chart.labels', ['Richard', 'Alex', 'Nick', 'Scott', 'Kjnell', 'Doug', 'Charles', 'Michelle', 'Mark', 'Alison']);
	bar.Set('chart.gutter', 45);
	bar.Set('chart.background.barcolor1', 'rgba(255,255,255,1)');
	bar.Set('chart.background.barcolor2', 'rgba(255,255,255,1)');
	bar.Set('chart.background.grid', true);
	bar.Set('chart.colors', ['rgba(255,0,0,1)']);
		
	bar.Draw();
}