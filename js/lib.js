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
	}
}
