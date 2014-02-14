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
			var basketURLParams = basket_utils.buildUrlParams();
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
						$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + keyValue + "'/><a onClick=\"javascript:basket_utils.removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign'></i></div>" + layerName + "</a></li>"));	
						
						//
						// Change the cart style and show the basket component
						//
						var cartId = keys.id;
						var cartButton = $("#" + cartId);
						cartButton.attr("class", "label basket-label-cart-red");
						cartButton.empty();
						cartButton.append($("<i class='icon-shopping-cart'></i> <spam>Remove from Cart</spam>"));
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
