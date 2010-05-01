active = 1;

document.addEventListener ("mousemove",function (){active=1;},false);
document.addEventListener ("keypress",function (){active=1;},false);

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	sendResponse({value:active});
	active = 0;
});