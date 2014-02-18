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
						
						if(!this.hidden_resource_list){
							this.hidden_resource_list = cart.children()[0].value;
						}						
						
						$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + this.hidden_resource_list + "'/><input type='hidden' value='" + keys.package_id + "," + keys.id + "'/><a onClick=\"javascript:basket_utils._removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign'></i></div>" + layerName + "</a></li>"));	
						
						//
						// Change the cart style and show the basket component
						//
						var cartId = "cart-" + keys.package_id;
						var cartButton = $("#" + cartId);
						cartButton.attr("class", "label basket-label-cart-red");
						cartButton.attr("onClick", "javascript:basket_utils.removeFromBasket(" + this.hidden_resource_list + ", '" + cartId + "');");
						cartButton.empty();
						cartButton.append($("<i class='icon-shopping-cart'></i> <spam>Remove from Cart</spam>"));
					}
				}
				
				this.hidden_resource_list = null;
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
