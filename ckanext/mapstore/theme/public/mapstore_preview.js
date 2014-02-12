// WMS preview module
this.ckan.module('mapstorepreview', function (jQuery, _) {
    // Private
    var defaultVersion = "1.1.1";
	
	var getCapabilitiesUrl = function(server,version){

        version = version || defaultVersion;

        if (server.indexOf("?") === -1)
            server += "?"

        var url  = server +
                   "SERVICE=WMS" +
                   "&REQUEST=GetCapabilities" +
                   "&VERSION=" + version;

		return encodeURIComponent(url)
    }
	
	var cleanUrl = function(server){
        var qs;
        if (server.indexOf("?") !== -1){
			parts = server.split("?");
			server = parts[0];
			qs = parts[1];
        }

        return server;
    }
	
	return{
		options: {
			i18n: {
			}
		},

		initialize: function () {
			jQuery.proxyAll(this, /_on/);
			this.el.ready(this._onReady);
		},

		_onReady: function() {
			var resource = preload_resource;
			var url = resource.url;
			
			var wmsUrl, capabilitiesUrl;
			if(url.indexOf('mapId') == -1){
				wmsUrl = cleanUrl(url);
				capabilitiesUrl = getCapabilitiesUrl(wmsUrl);
			}
			
			$("#mapstore-preview").empty();
			
			// //////////////////////////////////////////////////
			// Build the Iframe to show the MapStore Viewer
			// //////////////////////////////////////////////////
			var config = preview_config;
			var mapstoreBaseURL = config.mapStoreBaseURL;
					
			if(resource.format == "wms"){
				var keyValue = resource.name + "," + capabilitiesUrl;
				$("#mapstore-preview").append($("<div style='padding-left:10px;' class='show-btn'><a class='show show-secondary' onClick=\"javascript:addToBasket('" + keyValue + "')\">Add To Basket</a><br/></div>"));
			}
			
			// //////////////////////////////////////
			// Set URL in show layers basket button
			// //////////////////////////////////////
			var basketURLParams = this.buildUrlParams("basket", null, null, null);
			var src = mapstoreBaseURL + config.composerPath + "?" + basketURLParams.join("&");
		    var srcElement = $("#showBasket");
	        var srcValue = srcElement.attr("href", src);
			
			// ////////////////////////////////////////////
			// Set URL in basic show map button (composer)
			// ////////////////////////////////////////////
			var composerURLParams = this.buildUrlParams("composer", capabilitiesUrl, resource, url);
			src =  "'" + mapstoreBaseURL + config.composerPath + "?" + composerURLParams.join("&") + "'";
			$("#mapstore-preview").append($("<div class='show-btn'><a id='showInTab' class='show show-primary' href=" + src + " target='_blank'>Show Map in a new Tab</a><br/></div>"));
			
		    // ///////////////////////////////////////////////////////
			// Set URL for the embedded preview and build the iframe
			// ///////////////////////////////////////////////////////
			var viewerURLParams = this.buildUrlParams("viewer", capabilitiesUrl, resource, url);
			src = mapstoreBaseURL + config.viewerPath + "?" + viewerURLParams.join("&");
						
			$("#mapstore-preview").append($("<iframe></iframe>").attr("id", "mapstore-ifame"));
			$("#mapstore-ifame").attr("style", "border: none;");
			$("#mapstore-ifame").attr("height", "500");
			$("#mapstore-ifame").attr("width", "100%");
			$("#mapstore-ifame").attr("src", src);
			
			//
			// Basked Management block
			// 
			if(resource.format == "wms"){
				$("#basketContainer").append($("<h2>Layers in Basket</h2>"));
				$("#basketContainer").append($("<div id='basket'><p>No elements selected</p><ul id='basketlist' class='list-group'></ul><div>"));
				
				// /////////////////////////////
				// Build the Basket list
				// /////////////////////////////
				this.buildBasketList();
			}
        },
		
		buildUrlParams: function(template, capabilitiesUrl, resource, url){
			var config = preview_config;
			var URLParams = [];		
						
			URLParams.push("locale=en");                // TODO: link to the Ckan locale ???
			
			if(template == "viewer" || template == "composer"){
				if(capabilitiesUrl && resource){
					URLParams.push("wmsurl=" + capabilitiesUrl);
					URLParams.push("layName=" + resource.name);
				}else{
					URLParams.push("mapId=" + url.split("=")[1]);
				}
			}
			
			if(template == "viewer"){
				URLParams.push("langSelector=false");
				URLParams.push("config=" + config.viewerConfigName);
			}
			
			if(template == "basket"){
				URLParams.push("useCookies=true");
			}
			
			return URLParams;
		},
		
		/*buildUrlParams: function(template, capabilitiesUrl, resource, url){
			var config = preview_config;
			var URLParams = [];		
						
			URLParams.push("locale=en");                // TODO: link to the Ckan locale ???
			
			if(template == "composer"){
				var withCookies = this.checkCookies();
				if(!withCookies){
					if(capabilitiesUrl && resource){
						URLParams.push("wmsurl=" + capabilitiesUrl);
						URLParams.push("layName=" + resource.name);
					}else{
						URLParams.push("mapId=" + url.split("=")[1]);
					}
				}else{
					URLParams.push("useCookies=true");
				}
			}else if(template == "viewer"){
				if(capabilitiesUrl && resource){
					URLParams.push("wmsurl=" + capabilitiesUrl);
					URLParams.push("layName=" + resource.name);
				}else{
					URLParams.push("mapId=" + url.split("=")[1]);
				}
				
				URLParams.push("langSelector=false");
				URLParams.push("config=" + config.viewerConfigName);
			}
			
			return URLParams;
		},*/
		
		buildBasketList: function(){
				var existingCookieValue = readCookie("layersList");
	
				if(existingCookieValue && existingCookieValue != ""){
					var arrayList = existingCookieValue.split("#");
		
					var newArray = [];
					for(var i=0; i<arrayList.length; i++){
						var keyValue = arrayList[i];
						
						if(keyValue){
							var layerName = keyValue.split(",")[0];
							$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + keyValue + "'><div class='show-btn'><a class='show show-secondary removeBtn' onClick=\"javascript:removeFromBasket('" + keyValue + "')\">Remove</a><br/></div>" + layerName + "</li>"));
						}
					}
				}
				
				if(this.checkForElementsInBasket()){
					var basket = $("#basket");
					var basketFirstChild = $("#basket").children()[0];
					basketFirstChild.remove();
					showButton("basketButton");
				}		
		},
		
		checkForElementsInBasket: function(){
			var basketListChilds = $("#basketlist").children();
			if(basketListChilds.length > 0){
				return true;
			}else{
				return false
			}
		},
		
		checkCookies: function(){
			var existingCookieValue = readCookie("layersList");
			
			if(existingCookieValue && existingCookieValue != ""){
				var arrayList = existingCookieValue.split("#");
				return arrayList.length > 0 ? true : false;
			}
		}
    }
});
