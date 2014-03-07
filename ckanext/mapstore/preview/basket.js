// BASKET module
this.ckan.module('basket', function (jQuery, _) {
    // Private here
	
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
			var config = preview_config;
			
			// /////////////////////////////
			// Build the Basket list
			// /////////////////////////////
			this.buildBasketList();
			
			//
			// Set the show layers button
			//
			var basketURLParams = basket_utils.buildUrlParams("basket");
			var src = config.mapStoreBaseURL + config.composerPath + "?" + basketURLParams.join("&");
			var srcElement = $("#showBasket");
			var srcValue = srcElement.attr("href", src);
        },
		
		buildBasketList: function(){
			var existingCookieValue = this.checkCookies();
			
			if(existingCookieValue){
				var arrayList = existingCookieValue.split("#");
	
				var newArray = [];
				for(var i=0; i<arrayList.length; i++){
					var keyValue = arrayList[i];
					
					if(keyValue){
						var keys = unescape(keyValue);
						keys = $.parseJSON(keys);
						
						var layerName = keys.layer;
						if(layerName.indexOf(":") != -1){
							layerName = layerName.split(":")[1];
						}
						
						//
						// Take the resource list from the hidden input of cart button
						//
						var cart = $("#cart-" + keys.package_id );
						var hidden_resource_list;
						if(cart && cart.children()[0]){
							hidden_resource_list = cart.children()[0].value;
						}					

						if(keys.verified == 'True'){
							// resource verified OK during the harvest process
							$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + hidden_resource_list + "'/><input type='hidden' value='" + keys.package_id + "," + keys.id + "'/><div class='facet-kill pull-left'><i class='icon-large icon-ok' style='color: #188F26;'></i></div> " + layerName + "<a onClick=\"javascript:basket_utils._removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign' style='color: #777777;'></i></div></a></li>"));	
						}else{
							// resource verified NOT RUNNING during the harvest process
							$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + hidden_resource_list + "'/><input type='hidden' value='" + keys.package_id + "," + keys.id + "'/><div class='facet-kill pull-left'><i class='icon-large icon-minus-sign' style='color: #ED0C26;'></i></div> " + layerName + "<a onClick=\"javascript:basket_utils._removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign' style='color: #777777;'></i></div></a></li>"));	
						}
						
						//
						// Change the cart style and show the basket component
						//
						var cartId = "cart-" + keys.package_id;
						var cartButton = $("#" + cartId);
						if(cartButton){
							cartButton.attr("class", "label basket-label-cart-red");
							cartButton.attr("onClick", "javascript:basket_utils.removeFromBasket(" + hidden_resource_list + ", '" + cartId + "');");
							
							var cartIconId = "cart-icon-" + keys.package_id;
							var cartIconButton = $("#" + cartIconId);	

							if(cartIconButton){
								cartIconButton.empty();						
								cartIconButton.append($("<i class='icon-shopping-cart'></i> <spam>Remove from Cart</spam>"));
							}	
						}

						//this.hidden_resource_list = null;
					}
				}			
			}
			
			if(this.checkForElementsInBasket()){
				basket_utils.showBasket("shopping-basket-container", "basket-header");
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
			var existingCookieValue = basket_utils.readCookie("layersList");
			
			if(existingCookieValue && existingCookieValue != ""){
				var arrayList = existingCookieValue.split("#");
				return arrayList.length > 0 ? existingCookieValue : undefined;
			}
		}
    }
});
