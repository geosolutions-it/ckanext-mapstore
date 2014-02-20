var basket_utils = {
	
	basketContainerId:"shopping-basket-container", 
	
	basketHeaderId: "basket-header",
	
	basketCollapseButtonId: "shopping-basket-collapse",
	
	/**
	 * Prepare the URL for mapstore preview (maps from geostore)
	 */
	preparePreviewURL: function(resource_list){		
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];
			var capabilitiesUrl = this.getCapabilitiesURL(resource.url);
			
			var URLParams = this.buildUrlParams("simple", capabilitiesUrl, resource.name, resource.url);		
			
			var config = preview_config;
			var href = config.mapStoreBaseURL + config.composerPath + "?" + URLParams.join("&");
			
			window.open(href);
		}
	},
	
	/**
	 * Build the single cookie
	 */
	prepareKey: function(resource){
		var capabilitiesUrl = this.getCapabilitiesURL(resource.url);
		var keyValue = "{\"package_id\":\"" + resource.package_id + "\", \"id\":\"" + resource.id + "\", \"layer\":\"" + resource.name + "\", \"wms\":\"" + capabilitiesUrl + "\"}";
		keyValue = escape(keyValue);
		
		return keyValue;		
	},
	
	/**
	 * Add a new element to teh basket div
	 */	
	addToBasket: function(resource_list, package_id){		
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];				
			var keyValue = this.prepareKey(resource);			
			this._addToBasket(keyValue, resource_list);
		}
		
		//
		// Change the cart style and OnClick method for remove and show the basket component
		//
		var cartId = package_id;
		var cartButton = $("#" + cartId);
		cartButton.attr("onClick", "javascript:basket_utils.removeFromBasket(" + JSON.stringify(resource_list) + ", '" + cartId + "');");
		
		this.setCartButtonStyle(cartId, true);		
		this.showBasket(this.basketContainerId, this.basketHeaderId);
	},

	/**
	 * Remove ad element from the basket div
	 */	
	removeFromBasket: function(resource_list, package_id){
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];				
			var keyValue = this.prepareKey(resource);			
			this._removeFromBasket(keyValue);
		}
	},

	/**
	 * Manages the direct preview call (from the dataset list page) for WMS resources
	 */	
	previewOnMap: function(resource_list){
		this.eraseCookie("previewList");
		
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];	
		    var key = this.prepareKey(resource);
			var keyValue = this.preparePreviewOnMapCookie(key);			
		}
		
		var URLParams = this.buildUrlParams("preview");
		var config = preview_config;
		var href = config.mapStoreBaseURL + config.composerPath + "?" + URLParams.join("&");
		
		window.open(href);				
	},

	/**
	 * Build the cookie for the direct WMS preview (from the dataset list page)
	 */	
	preparePreviewOnMapCookie: function(keyValue){
		var existingCookieValue = this.readCookie("previewList");

		if(existingCookieValue && existingCookieValue != ""){
			existingCookieValue += "#" + keyValue;
			this.eraseCookie("previewList");
			this.createCookie("previewList", existingCookieValue, null);
		}else{
			this.createCookie("previewList", keyValue, null);
		}
	},

	/**
	 * Parse the WMS GetCapabilities URL 
	 */
	getCapabilitiesURL: function(url){
		var wmsUrl, capabilitiesUrl;
		if(url.indexOf('data') == -1){
			wmsUrl = mapstore_utils.cleanUrl(url);
			capabilitiesUrl = mapstore_utils.getCapabilitiesUrl(wmsUrl);
		}
		
		return capabilitiesUrl;
	},

	/**
	 * Build URL params for preview URLs
	 */	
	buildUrlParams: function(template, capabilitiesUrl, name, url){
		var URLParams = [];		
		
		URLParams.push("locale=en");                // TODO: link to the Ckan locale ???
		
		if(template == "simple"){
			if(capabilitiesUrl && name){
				URLParams.push("wmsurl=" + capabilitiesUrl);
				URLParams.push("layName=" + name);
			}else{
				var pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
				var mHost = pattern.exec(url);
				
				URLParams.push("gsturl=" + encodeURIComponent(mHost[1] + mHost[2] + "/geostore/rest/"));
				URLParams.push("mapId=" + url.split("data/")[1]);
			}
		}else if(template == "preview"){
			URLParams.push("useCookies=previewList");
		}else if(template == "basket"){
			URLParams.push("useCookies=layersList");
		}
		
		if(template == "basket" || template == "preview"){
			var config = preview_config;
			var backgroundData = config.backgroundData;
			
			if(backgroundData){
				var baseMapId = backgroundData.baseMapId;			
			
				if(baseMapId){
					URLParams.push("mapId=" + baseMapId);
					var geostoreBaseUrl = encodeURIComponent(backgroundData.geostoreBaseUrl);
				
					if(geostoreBaseUrl){
						URLParams.push("gsturl=" + geostoreBaseUrl);
					}
				}
			}	
		}
		
		return URLParams;
	},

	/**
	 * Hide the basket div removing the content if remove = true
	 */
	hideBasket: function(elementId, headerId, remove){		
		if(remove === true){
			//
			// Hide the basket list 
			//
			var element = $("#" + elementId);
			element.attr("style", "display: none;");
			
			//
			// Reset the collapse button
			//
			var collapse = $("#" + this.basketCollapseButtonId);		
			collapse.empty();
			collapse.append($("<i class='icon-large icon-minus'></i>"));
			
			//
			// Hide the header
			//
			var header = $("#" + headerId);
			header.attr("style", "display: none;");
			
			//
			// Remove all elements from the basket
			//
			this._removeFromBasket('all');
		}else{
			var element = $("#" + elementId);
			var collapse = $("#" + this.basketCollapseButtonId);
			
			if(element.is(":visible")){
				element.attr("style", "display: none;");
				
				//
				// If there are not element inside the list reset the header elements
				//
				if($("#basketlist").children().length < 1){
					var header = $("#" + headerId);
					header.attr("style", "display: none;");
					
					collapse.empty();
					collapse.append($("<i class='icon-large icon-minus'></i>"));
				}else{
					collapse.empty();
					collapse.append($("<i class='icon-large icon-plus'></i>"));
				}
			}else{
				//
				// Expand the basket list and update the collapse button 
				//
			    element.attr("style", "display: block;");
				
				collapse.empty();
				collapse.append($("<i class='icon-large icon-minus'></i>"));
			}
		}
	},

	/**
	 * Shows teh Basket div
	 */
	showBasket: function(elementId, headerId){
		var element = $("#" + headerId);
		element.attr("style", "display: block;");
		element = $("#" + elementId);
		element.attr("style", "display: block;");
	},

	/**
	 * Private method to add element to the basket. It manages the list of sub element
	 */
	_addToBasket: function(keyValue, resource_list){
		var existingCookieValue = this.readCookie("layersList");
		
		if(existingCookieValue && existingCookieValue != ""){
			existingCookieValue += "#" + keyValue;
			this.eraseCookie("layersList");
			this.createCookie("layersList", existingCookieValue, null);
		}else{
			this.createCookie("layersList", keyValue, null);
		}
		
		// //////////////////////////////////////////////
		// Create the HTML element into the Basket list
		// //////////////////////////////////////////////
		
		if(keyValue){
			var basketListChilds = $("#basketlist").children();

			var keys = unescape(keyValue);
			keys = $.parseJSON(keys);
			
			var layerName = keys.layer;
			if(layerName.indexOf(":") != -1){
				layerName = layerName.split(":")[1];
			}
			
			$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + JSON.stringify(resource_list) + "'/><input type='hidden' value='" + keys.package_id + "," + keys.id + "'/><a onClick=\"javascript:basket_utils._removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign'></i></div>" + layerName + "</a></li>"));	
		}
	},

	/**
	 * Private method to remove element from the basket. It manages the list of sub element
	 * and the keys coockie control to enable/disable teh cart button from the dataset list 
	 */
	_removeFromBasket: function(keyValue){
		var existingCookieValue = this.readCookie("layersList");
		
		if(existingCookieValue && existingCookieValue != ""){
			var arrayList = existingCookieValue.split("#");
			
			var newArray = [];
			for(var i=0; i<arrayList.length; i++){
				var element = arrayList[i];

				if(element != keyValue && keyValue != 'all'){
					newArray.push(element);
				}else{
					// //////////////////////////////////////////////
					// Remove the HTML element from the Basket list
					// //////////////////////////////////////////////
					
					var basketListChilds = $("#basketlist").children();
					for(var k=0; k<basketListChilds.length; k++){
						var child = basketListChilds[k];
						
					    // Hidden resource list to restore
						var hiddenResourceList = child.children[0].value;						
						
						// Hidden package_id
						var hiddenKeys = child.children[1].value;
						var hidden_package_id = hiddenKeys.split(",")[0];
						var hidden_resource_id = hiddenKeys.split(",")[1];
					
						if(keyValue != 'all'){
							var keys = unescape(keyValue);
							keys = $.parseJSON(keys);
							
							var resource_id = keys.id;
							if(resource_id == hidden_resource_id){
								var package_id = keys.package_id;
								if(this.checkIfLast(package_id)){
									//
									// Revert the related cart button to the original state
									//	
									var cartId = "cart-" + package_id;
									var cartButton = $("#" + cartId);
									cartButton.attr("onClick", "javascript:basket_utils.addToBasket(" + hiddenResourceList + ", '" + cartId + "');");
									
									this.setCartButtonStyle(cartId, false);	
								}
								
								$(child).remove();
							}
						}else{
							if(this.checkIfLast(hidden_package_id)){
								//
								// Revert the related cart button to the original state
								//	
								var cartId = "cart-" + hidden_package_id;
								var cartButton = $("#" + cartId);
								cartButton.attr("onClick", "javascript:basket_utils.addToBasket(" + hiddenResourceList + ", '" + cartId + "');");
								
								this.setCartButtonStyle(cartId, false);	
							}			
							
							$(child).remove();
						}
					}	
				}
			}
			
			if(newArray.length < 1){
				this.eraseCookie("layersList");
			}else{
				var newCookie = newArray.join("#");
				this.eraseCookie("layersList");
				this.createCookie("layersList", newCookie, null);
			}
			
			//
			// Check for empty list
			//
			var basketListChilds = $("#basketlist").children();
			if(basketListChilds.length < 1 && keyValue != 'all'){
				this.hideBasket(this.basketContainerId, this.basketHeaderId, false);
			}	
		}
	},

	/**
	 * Check if an element is the last for a certain package inside the basket list. this is used in order to reset 
	 * the cart button CSS to teh origin one before the remove operation.
	 */	
	checkIfLast: function(package_id){
		var basketListChilds = $("#basketlist").children();
		
		var index = 0;
		for(var k=0; k<basketListChilds.length; k++){
			var child = basketListChilds[k];
			
			// Hidden package_id
		    var hiddenKey = child.children[1].value.split(",")[0];	
			if(hiddenKey == package_id){
				index++;
			}
		}
		
		return index == 1 ? true : false;
	},

	/**
	 * Change the cart button style (toggle)
	 */	
	setCartButtonStyle: function(cartId, pressed){
		var cartButton = $("#" + cartId);
		cartButton.empty();
		
		if(pressed){
			cartButton.attr("class", "label basket-label-cart-red");
			cartButton.append($("<i class='icon-shopping-cart'></i> <spam>Remove from Cart</spam>"));
		}else{
			cartButton.attr("class", "label basket-label-cart");
			cartButton.append($("<i class='icon-shopping-cart'></i> <spam>Add to Cart</spam>"));
		}
	},

	/**
	 * Creates the cookie
	 */
	createCookie: function(name, value, days) {
		if (days) {
			var date = new Date();
			
			var d = days*24*60*60*1000;
			var u = date.getTime() + d;
			
			date.setTime(u);
			var expires = "; expires=" + date.toGMTString();
		}else {
			var expires = "";
		}		
		
		document.cookie = name + "=" + value + expires + "; path=/";
	},

    /**
	 * Read a cookie
	 */
	readCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		
		return null;
	},
	
	/**
	 * Delete a cookie
	 */
	eraseCookie: function (name) {
		this.createCookie(name, "", -1);
	}
}

