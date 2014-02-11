addToBasket = function(keyValue){
	var existingCookieValue = readCookie("layersList");
	
	if(existingCookieValue && existingCookieValue != ""){
		existingCookieValue += "#" + keyValue;
		eraseCookie("layersList");
		createCookie("layersList", existingCookieValue, null);
	}else{
		createCookie("layersList", keyValue, null);
	}
	
	// //////////////////////////////////////////////
	// Create the HTML element into the Basket list
	// //////////////////////////////////////////////
	
	if(keyValue){
		var basketListChilds = $("#basketlist").children();
		if(basketListChilds.length < 1){
			var basket = $("#basket");
			var basketFirstChild = $("#basket").children()[0];
			basketFirstChild.remove();
		}		
		
		var layerName = keyValue.split(",")[0];
		$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + keyValue + "'><div class='show-btn'><a class='show show-secondary removeBtn' onClick=\"javascript:removeFromBasket('" + keyValue + "')\">Remove</a><br/></div>" + layerName + "</li>"));
		
		updateComposerSrc(true);
	}
}

removeFromBasket = function(keyValue){
	var existingCookieValue = readCookie("layersList");
	
	if(existingCookieValue && existingCookieValue != ""){
		var arrayList = existingCookieValue.split("#");
		
		var newArray = [];
		for(var i=0; i<arrayList.length; i++){
			var element = arrayList[i];
			var contains = element.indexOf(keyValue);			
			if(contains == -1){
				newArray.push(arrayList[i]);
			}else{
				// //////////////////////////////////////////////
				// Remove the HTML element from the Basket list
				// //////////////////////////////////////////////
				
				var basketListChilds = $("#basketlist").children();
				for(var k=0; k<basketListChilds.length; k++){
					var child = basketListChilds[k];
					
					var hiddenValue = child.children[0].value;
					
					var hidenLayerName = hiddenValue.split(",")[0];
					var hiddenWMS = hiddenValue.split(",")[1];
					
					var layerName = keyValue.split(",")[0];
					var wms = keyValue.split(",")[1];
					if(hidenLayerName == layerName && hiddenWMS == wms){
						child.remove();
					}
				}
			}
		}
		
		if(newArray.length < 1){
			eraseCookie("layersList");
		}else{
			var newCookie = newArray.join("#");
			eraseCookie("layersList");
			createCookie("layersList", newCookie, null);
		}
		
		//
		// Check for empty list
		//
		var basketListChilds = $("#basketlist").children();
		if(basketListChilds.length < 1){
			$("#basket").prepend($("<p>No elements selected</p>"));
			updateComposerSrc(false);
		}	
	}
}

function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		
		var d = days*24*60*60*1000;
		var u = date.getTime() + d;
		
		date.setTime(u);
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}

function updateComposerSrc(useCookies){
	var srcElement = $("#showInTab");
	var srcValue = srcElement.attr("href");
	
	var search = srcValue.split("?")[1];
	var params = search.replace(/&amp;/g,'&').split("&");
	var newParamsArray = [];
	
	for (var j=0; j < params.length; j++) {
		var param = params[j].split("=");
		if(param[0]){
			if(useCookies === true){
				if(param[0] != "wmsurl" && param[0] != "layName"){
					newParamsArray.push(params[j]);
				}
			}else if(param[0] != "useCookies"){
				newParamsArray.push(params[j]);
			}
		}
	}
	
	var newSrc = newParamsArray.join("&");
	if(useCookies === true){
		if(newSrc.indexOf("useCookies") == -1){
			newSrc += "&useCookies=true";
		}
	}else{	
		var resource = preload_resource;
		var url = resource.url;
		
		//
		// Clean the URL and build the WMS GetCapabilities
		// 
		var wmsUrl, capabilitiesUrl;		
		if (url.indexOf("?") !== -1){
			parts = url.split("?");
			wmsUrl = parts[0];
		}
		
		if (wmsUrl.indexOf("?") === -1)
			wmsUrl += "?"

		var wmsUrl = wmsUrl +
			   "SERVICE=WMS" +
			   "&REQUEST=GetCapabilities" +
			   "&VERSION=1.1.1";
			   
		capabilitiesUrl = encodeURIComponent(wmsUrl);
		
		if(newSrc.indexOf("wmsurl") == -1){
			newSrc += "&wmsurl=" + capabilitiesUrl;
		}
		
		if(newSrc.indexOf("layName") == -1){
			newSrc += "&layName=" + resource.name;
		}
	}
	
	var config = preview_config;
	var newSrc = config.mapStoreBaseURL + config.composerPath + "?" + newSrc;
	$("#showInTab").attr("href", newSrc);
}
