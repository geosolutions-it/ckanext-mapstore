// BASKET module
this.ckan.module('basket', function (jQuery, _) {
    // Private here
	
	return{
		options: {
			i18n: {
				en:{
					configMethodErrorMsg: "Configuration Error. Valid values for 'storageMethod' property are: cookies, sessionstorage or localstorage.",
					showLayersBtn: "Show Layers",
					removeFromCartBtn: " Remove from Map",
					addToCartBtn: " Add to Map",
					storeExceededMsg: "Store dimension exceeded for shopping cart. Some items may not have been added to the cart.",
					mapPreviewList: "Map Preview List",
					previewOnMap: " Preview on Map"
				},
				it:{
					configMethodErrorMsg: "Errore di configurazione. Valori validi per la proprietà 'storageMethod' sono: cookies, sessionstorage o localstorage.",
					showLayersBtn: "Visualizza Livelli",
					removeFromCartBtn: " Rimuovi dalla Mappa",
					addToCartBtn: " Aggiungi alla Mappa",
					storeExceededMsg: "Raggiunta la dimesione massima del carrello. Alcuni oggetti potrebbero non essere aggiunti, rimuoverne alcuni.",
					mapPreviewList: "Lista Anteprima Mappa",
					previewOnMap: " Anteprima su Mappa"
				}
			}
		},

		initialize: function () {
			jQuery.proxyAll(this, /_on/);
			this.el.ready(this._onReady);
		},

		_onReady: function() {
			var locale = preview_config.forceLocaleTo || ckan.i18n.defaults.locale_data.messages[""].lang || "en";
			this.setI18N(locale);
			
			this.configurationCheck();
			
			// /////////////////////////////
			// Build the Basket list
			// /////////////////////////////
			this.buildBasketList();
			
			//
			// Set the show layers button
			//
			var basketURLParams = basket_utils.buildUrlParams("basket");
			var src = preview_config.mapStoreBaseURL + preview_config.composerPath + "?" + basketURLParams.join("&");
					
			var basketButton = $("#basketButton");
			if(preview_config.storageMethod === "cookies"){
				basketButton.append($("<a id=\"showBasket\" class='btn' href=\"#\" target='_blank'> " + this.msgs.showLayersBtn + "</a>"));
				var showBasket = $("#showBasket");
				showBasket.attr("href", src);
			}else{
				basketButton.append($("<a id=\"showBasket\" class='btn' onclick=\"javascript:basket_utils.postToMapStore(\'" + src + "\');\" target='_blank'> " + this.msgs.showLayersBtn + "</a>"));
			}
        },
		
		setI18N: function(locale){
			this.msgs = eval("this.options.i18n." + locale);
			
			//
			// Set the i18n in also in basket utils
			//
			basket_utils.i18n = this.msgs;
			basket_utils.locale = locale;
			
			//
			// Set i18n in templates
			//
			var me = this.msgs;
			
			$('spam[id="ckanext-mapstore-mapPreviewList"]').each(function(a, b) {
				var obj = $(b);
				obj.text(me.mapPreviewList);
			});
			
			$('spam[id="ckanext-mapstore-addToCart"]').each(function(a, b) {
				var obj = $(b);
				obj.text(me.addToCartBtn);
			});
			
			$('spam[id="ckanext-mapstore-previewOnMap"]').each(function(a, b) {
				var obj = $(b);
				obj.text(me.previewOnMap);
			});
		},
		
		configurationCheck: function(){
			if(preview_config){
				var method = preview_config.storageMethod;
				if(method){
					if(method != "sessionstorage" && method != "localstorage" && method != "cookies"){
						alert(this.msgs.configMethodErrorMsg);
					}
				}else{
					preview_config.storageMethod = "sessionstorage";
				}
			}
		},
		
		buildBasketList: function(){
			var existingStoreValue = this.checkForStorage();
			
			if(existingStoreValue){
				var arrayList = existingStoreValue.split("#");
	
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
						
						$("#basketlist").append($("<li class='list-group-item'><input type='hidden' value='" + hidden_resource_list + "'/><input type='hidden' value='" + keys.package_id + "," + keys.id + "'/>" + icon + layerName + "<a onClick=\"javascript:basket_utils._removeFromBasket('" + keyValue + "')\"><div class='facet-kill pull-right'><i class='icon-large icon-remove-sign' style='color: #777777;'></i></div></a></li>"));	

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
								cartIconButton.append($("<i class='icon-shopping-cart'></i> <spam>" + this.msgs.removeFromCartBtn + "</spam>"));
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
		
		checkForStorage: function(){
			var existingStoreValue = basket_utils.readStore("layersList");
			
			if(existingStoreValue && existingStoreValue != ""){
				var arrayList = existingStoreValue.split("#");
				return arrayList.length > 0 ? existingStoreValue : undefined;
			}
		}
    }
});
