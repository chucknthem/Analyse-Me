AnalyseMe_active = 1;

document.addEventListener ("mousemove",function (){AnalyseMe_active=1;},false);
document.addEventListener ("keypress",function (){AnalyseMe_active=1;},false);

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	sendResponse({value:AnalyseMe_active});
	AnalyseMe_active = 0;
});
