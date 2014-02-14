var basket_utils = {
	
	basketContainerId:"shopping-basket-container", 
	
	basketHeaderId: "basket-header",
	
	basketCollapseButtonId: "shopping-basket-collapse",
	
	preparePreviewURL: function(id, url, name, format){
		var capabilitiesUrl = this.getCapabilitiesURL(url);
		
		var URLParams = this.buildUrlParams("preview", capabilitiesUrl, name, url);		
		
		var config = preview_config;
		var href = config.mapStoreBaseURL + config.composerPath + "?" + URLParams.join("&");
		
		window.open(href);
	},
	
	prepareKeyForBasket: function(id, url, name, format){
		var capabilitiesUrl = this.getCapabilitiesURL(url);
		//var keyValue = id + "," + name + "," + capabilitiesUrl;		
		var keyValue = "{\"id\":\"" + id + "\", \"layer\":\"" + name + "\", \"wms\":\"" + capabilitiesUrl + "\"}";
		keyValue = escape(keyValue);
		
		var cartButton = $("#" + id);
		var cartClass = cartButton.attr("class");
		if(cartClass == "label basket-label-cart-red"){
			this.removeFromBasket(keyValue);
		}else{
			this.addToBasket(keyValue);
		}	
	},
	
	getCapabilitiesURL: function(url){
		var wmsUrl, capabilitiesUrl;
		if(url.indexOf('mapId') == -1){
			wmsUrl = mapstore_utils.cleanUrl(url);
			capabilitiesUrl = mapstore_utils.getCapabilitiesUrl(wmsUrl);
		}
		
		return capabilitiesUrl;
	},
	
	buildUrlParams: function(template, capabilitiesUrl, name, url){
		var URLParams = [];		
		
		URLParams.push("locale=en");                // TODO: link to the Ckan locale ???
		
		if(template == "preview"){
			if(capabilitiesUrl && name){
				URLParams.push("wmsurl=" + capabilitiesUrl);
				URLParams.push("layName=" + name);
			}else{
				URLParams.push("mapId=" + url.split("=")[1]);
			}
		}else{
			URLParams.push("useCookies=true");
		}
		
		return URLParams;
	},

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
			this.removeFromBasket('all');
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

	showBasket: function(elementId, headerId){
		var element = $("#" + headerId);
		element.attr("style", "display: block;");
		element = $("#" + elementId);
		element.attr("style", "display: block;");
	},

	addToBasket: function(keyValue){
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

			//var keys = keyValue.split(",");	
			var keys = unescape(keyValue);
			keys = $.parseJSON(keys);
			
			var layerName = keys.layer;
			
			$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + keyValue + "'/><a onClick=\"javascript:basket_utils.removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign'></i></div>" + layerName + "</a></li>"));	
			
			//
			// Change the cart style and show the basket component
			//
			var cartId = keys.id;
			this.setCartButton(cartId, false);
			
			this.showBasket(this.basketContainerId, this.basketHeaderId);
		}
	},

	removeFromBasket: function(keyValue){
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
						var inputHiddenValue = child.children[0].value;
						
					    var hiddenKeys = unescape(inputHiddenValue);
						hiddenKeys = $.parseJSON(hiddenKeys);	
						
						var cartId;
						if(keyValue != 'all'){
							var keys = unescape(keyValue);
							keys = $.parseJSON(keys);							
														
							var hidenLayerName = hiddenKeys.layer;
							var hiddenWMS = hiddenKeys.wms;
							
							var layerName = keys.layer;
							var wms = keys.wms;
							
							if(hidenLayerName == layerName && hiddenWMS == wms){
								$(child).remove();
							}	

							cartId = keys.id;							
						}else{
							cartId = hiddenKeys.id;							
							$(child).remove();
						}
						
						//
						// Revert the cart button to the original state
						//						
						this.setCartButton(cartId, true);	
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
	
	setCartButton: function(cartId, pressed){
		var cartButton = $("#" + cartId);
		cartButton.empty();
		
		if(pressed){
			cartButton.attr("class", "label basket-label-cart");
			cartButton.append($("<i class='icon-shopping-cart'></i> <spam>Add to Cart</spam>"));
		}else{
			cartButton.attr("class", "label basket-label-cart-red");
			cartButton.append($("<i class='icon-shopping-cart'></i> <spam>Remove from Cart</spam>"));
		}
	},

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

	eraseCookie: function (name) {
		this.createCookie(name, "", -1);
	}
}

