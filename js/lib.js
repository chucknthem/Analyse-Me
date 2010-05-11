var Lib = {
	/*
	 * checks whether chrome has been active
	 * localStorage['lastActive'] stores the milliseconds since epoc time
	 * it needs to be updated by background.html and content scripts when activity is detected
	 */
	'isActive': function() {
		var lastActive = localStorage['lastActive'];
		if(!lastActive) {//never seen lastActive before, don't know what to do, default to true
			return true;
		}
		
		var now = new Date().getTime();
		if(now > lastActive + 1000*60*5) {
			return false;
		}
		return true;
	},
	/*
	 * convert an array fetched by DB.fetch into an object that's easier for
	 * RGraph to use
	 *
	 * @return {'host':[], 'count':[]}
	 */
	'makeGraphable': function(dbdata) {
		var graphdata = {'host':[], 'count':[]};
		for(var i = 0; i < dbdata.length; i++) {
			graphdata['host'].push(dbdata[i]['host']);
			graphdata['count'].push(dbdata[i]['count']);
		}
		return graphdata;
	}
}
