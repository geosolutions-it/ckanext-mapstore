// WMS preview module
this.ckan.module('mapstorepreview', function (jQuery, _) {
    // Private here
	
	return{
		options: {
			i18n: {
				en:{
					showMapInNewTabBtn: "Show in Advanced Viewer"
				},
				it:{
					showMapInNewTabBtn: "Mostra in Visualizzatore Avanzato"
				}
			}
		},

		initialize: function () {
			jQuery.proxyAll(this, /_on/);
			this.el.ready(this._onReady);
		},

		_onReady: function() {
			this.setI18N(preview_config.forceLocaleTo || ckan.i18n.defaults.locale_data.messages[""].lang || "en");
			
			var resource = preload_resource;
			var url = resource.url;
			
			var capabilitiesUrl = this.getCapabilitiesURL(url);
			
			$("#mapstore-preview").empty();
			
			// //////////////////////////////////////////////////
			// Build the Iframe to show the MapStore Viewer
			// //////////////////////////////////////////////////
			var config = preview_config;
			var mapstoreBaseURL = config.mapStoreBaseURL;
			
			// ////////////////////////////////////////////
			// Set URL in basic show map button (composer)
			// ////////////////////////////////////////////
			var composerURLParams = this.buildUrlParams("composer", capabilitiesUrl, resource, url);
			var src =  "'" + mapstoreBaseURL + config.composerPath + "?" + composerURLParams.join("&") + "'";
			$("#mapstore-preview").append($("<div class='show-btn'><a id='showInTab' class='show show-primary' href=" + src + " target='_blank'>" + this.msgs.showMapInNewTabBtn + "</a><br/></div>"));
			
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
        },
		
		setI18N: function(locale){
			this.msgs = eval("this.options.i18n." + locale);
			this.locale = locale;
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
	
		buildUrlParams: function(template, capabilitiesUrl, resource, url){
			var config = preview_config;
			var URLParams = [];		
						
			URLParams.push("locale=" + this.locale);                // TODO: link to the Ckan locale ???
			
			if(template == "viewer" || template == "composer"){
				if(capabilitiesUrl && resource){
					URLParams.push("wmsurl=" + capabilitiesUrl);
					URLParams.push("layName=" + resource.name);
					
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
				}else{
					var pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
					var mHost = pattern.exec(url);
					
					URLParams.push("gsturl=" + encodeURIComponent(mHost[1] + mHost[2] + "/geostore/rest/"));
					URLParams.push("mapId=" + url.split("data/")[1]);
				}
			}
			
			if(template == "viewer"){
				URLParams.push("langSelector=false");
				URLParams.push("config=" + config.viewerConfigName);
			}

			return URLParams;
		}
    }
});
