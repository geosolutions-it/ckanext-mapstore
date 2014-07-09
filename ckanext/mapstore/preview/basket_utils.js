
var basket_utils = {
	
	basketContainerId: "shopping-basket-container", 
	
	basketHeaderId: "basket-header",
	
	basketCollapseButtonId: "shopping-basket-collapse",
	
	storeSize: 3712,
	
	/**i18n: null,*/
	
	/**locale: null,*/
	
	postToMapStore: function(src, singlePreview){
		var basketButton = $("#basketButton");
		
		var storeValue;
		if(singlePreview === true){
			storeValue = this.readStore("previewList");
		}else{
			storeValue = this.readStore("layersList");
		}
		
		var msForm = $("#msForm");
		if(msForm){
			msForm.remove();
		}
		
		basketButton.append($("<form id=\"msForm\" action='' target=\"submission\" onsubmit=\"window.open('',this.target);return true;\" method=\"post\"><input type=\"hidden\" name=\"data\" value=\"" + storeValue + "\"></form>"));
		
		msForm = $("#msForm");
		msForm.attr("action", src);		
		
		msForm.submit();	
	},
	
	/**
	 * Prepare the URL for mapstore preview (maps from geostore)
	 */
	preparePreviewURL: function(resource_list){		
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];
			var capabilitiesUrl = this.getCapabilitiesURL(resource.url);
			
			var URLParams = this.buildUrlParams("simple", capabilitiesUrl, resource.name, resource.url);			
			var href = preview_config.mapStoreBaseURL + preview_config.composerPath + "?" + URLParams.join("&");
			
			window.open(href);
		}
	},
	
	/**
	 * Build the single store for resource
	 */
	prepareKey: function(resource){
		var capabilitiesUrl = this.getCapabilitiesURL(resource.url);
		var keyValue = "{\"verified\":\"" + resource.verified + "\", \"package_id\":\"" + resource.package_id + "\", \"id\":\"" + resource.id + "\", \"layer\":\"" + resource.name + "\", \"wms\":\"" + capabilitiesUrl + "\", \"pname\":\"" + resource.pname + "\"}";
		keyValue = escape(keyValue);
		
		return keyValue;		
	},
	
	/**
	 * Add a new element to teh basket div
	 */	
	addToBasket: function(resource_list, package_id){
		var styleChanged = false;
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];				
			var keyValue = this.prepareKey(resource);			
			var status = this._addToBasket(keyValue, resource_list);
			
			if(!styleChanged && status === true){
				// /////////////////////////////////////////////////////
				// Calculate the existing cookie dimension. The 
				// dimension could not exceeded the 4096 bytes.
				// /////////////////////////////////////////////////////
				var existingStoreValue = this.readStore("layersList");
				if(existingStoreValue){
					var dim = existingStoreValue.length;
					if(dim <= this.storeSize){
						//
						// Change the cart style and OnClick method for remove and show the basket component
						//
						var cartId = package_id;
						var cartButton = $("#" + cartId);
						cartButton.attr("onClick", "javascript:basket_utils.removeFromBasket(" + JSON.stringify(resource_list) + ", '" + cartId + "');");
						
						this.setCartButtonStyle(cartId, true);		
						this.showBasket(this.basketContainerId, this.basketHeaderId);
						styleChanged = true;
					}
				}
			}
		}
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
		this.eraseStore("previewList");
		
		for(var i=0; i<resource_list.length; i++){
			var resource = resource_list[i];	
		    var key = this.prepareKey(resource);
			var keyValue = this.preparePreviewOnMap(key);			
		}
		
		var URLParams = this.buildUrlParams("preview");
		
		var href = preview_config.mapStoreBaseURL + preview_config.composerPath + "?" + URLParams.join("&");
		
		if(preview_config.storageMethod === "cookies"){
			window.open(href);
		}else{
			this.postToMapStore(href, true);
		}
						
	},

	/**
	 * Build the store for the direct WMS preview (from the dataset list page)
	 */	
	preparePreviewOnMap: function(keyValue){
		var existingStoreValue = this.readStore("previewList");

		if(existingStoreValue && existingStoreValue != ""){
			existingStoreValue += "#" + keyValue;
			this.eraseStore("previewList");
			this.createStore("previewList", existingStoreValue, null);
		}else{
			this.createStore("previewList", keyValue, null);
		}
	},

	/**
	 * Parse the WMS GetCapabilities URL 
	 */
	getCapabilitiesURL: function(url){
		var wmsUrl, capabilitiesUrl;
		if(url.indexOf('geostore') == -1){
			capabilitiesUrl = mapstore_utils.getCapabilitiesUrl(url);
		}
		
		return capabilitiesUrl;
	},

	/**
	 * Build URL params for preview URLs
	 */	
	buildUrlParams: function(template, capabilitiesUrl, name, url){
		var URLParams = [];		
		
		URLParams.push("locale=" + this.locale);                // TODO: link to the real Ckan locale ???
		
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
		}else if(template == "preview" && preview_config.storageMethod === "cookies"){
			URLParams.push("useCookies=previewList");
		}else if(template == "basket" && preview_config.storageMethod === "cookies"){
			URLParams.push("useCookies=layersList");
		}
		
		if(template == "basket" || template == "preview"){			
			var backgroundData = preview_config.backgroundData;
			
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
		var existingStoreValue = this.readStore("layersList");
		var storeSize = 0;
		
		if(existingStoreValue && existingStoreValue != ""){
			// /////////////////////////////////////////////////////
			// Calculate the existing cookie dimension. The 
			// dimension could not exceeded the 4096 bytes.
			// /////////////////////////////////////////////////////
			var dim = (existingStoreValue + "#" + keyValue).length;
			if(dim > this.storeSize){
				storeSize = dim;
			}else{
				storeSize = dim;
				existingStoreValue += "#" + keyValue;
				this.eraseStore("layersList");
				this.createStore("layersList", existingStoreValue, null);
			}		
		}else{
			this.createStore("layersList", keyValue, null);
		}
		
		// //////////////////////////////////////////////
		// Create the HTML element into the Basket list
		// //////////////////////////////////////////////
		
		if(keyValue && storeSize <= this.storeSize){
			var basketListChilds = $("#basketlist").children();

			var keys = unescape(keyValue);
			keys = $.parseJSON(keys);
			
			var layerName = keys.layer;
			if(layerName.indexOf(":") != -1){
				layerName = layerName.split(":")[1];
			}
			
			var icon = "";
			if(preview_config.basketStatus === true){
				if(keys.verified == 'True'){
					// resource verified OK during the harvest process
					icon = "<div class='facet-kill pull-left'><i class='icon-large icon-ok' style='color: #188F26;'></i></div>";
				}else{
					// resource verified NOT RUNNING during the harvest process
					icon = "<div class='facet-kill pull-left'><i class='icon-large icon-minus-sign' style='color: #ED0C26;'></i></div>";
				}
			}
			
			$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + JSON.stringify(resource_list) + "'/><input type='hidden' value='" + keys.package_id + "," + keys.id + "'/>" + icon + layerName + "<a onClick=\"javascript:basket_utils._removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign' style='color: #777777;'></i></div></a></li>"));	

			return true;
		}else{
			alert(this.i18n.storeExceededMsg);
			return false;
		}
	},

	/**
	 * Private method to remove element from the basket. It manages the list of sub element
	 * and the keys coockie control to enable/disable teh cart button from the dataset list 
	 */
	_removeFromBasket: function(keyValue){
		var existingStoreValue = this.readStore("layersList");
		
		if(existingStoreValue && existingStoreValue != ""){
			var arrayList = existingStoreValue.split("#");
			
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
				this.eraseStore("layersList");
			}else{
				var newCookie = newArray.join("#");
				this.eraseStore("layersList");
				this.createStore("layersList", newCookie, null);
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
			cartButton.append($("<i class='icon-shopping-cart'></i> <spam>" + this.i18n.removeFromCartBtn + "</spam>"));
		}else{
			cartButton.attr("class", "label basket-label-cart");
			cartButton.append($("<i class='icon-shopping-cart'></i> <spam>" + this.i18n.addToCartBtn + "</spam>"));
		}
	},

    /**
	 * Creates the Store
	 */
	createStore: function(name, value, days) {
		if(preview_config.storageMethod === 'cookies'){
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
		}else if(preview_config.storageMethod === 'localstorage'){
			localStorage[name] = value;
		}else if(preview_config.storageMethod === 'sessionstorage'){
			sessionStorage[name] = value;
		}
	},

    /**
	 * Read a Store
	 */
	readStore: function(name) {
		if(preview_config.storageMethod === 'cookies'){
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			
			return null;
		}else if(preview_config.storageMethod === 'localstorage'){
			return localStorage[name];
		}else if(preview_config.storageMethod === 'sessionstorage'){
			return sessionStorage[name];
		}
	},
	
	/**
	 * Delete a Store
	 */
	eraseStore: function (name) {
		if(preview_config.storageMethod === 'cookies'){
			this.createStore(name, "", -1);
		}else if(preview_config.storageMethod === 'localstorage'){
			localStorage.removeItem(name);
		}else if(preview_config.storageMethod === 'sessionstorage'){
			sessionStorage.removeItem(name);
		}		
	}
}

