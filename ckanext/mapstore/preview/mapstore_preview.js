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
			this.setI18N(ckan.i18n.options.locale_data.ckan[""].lang || preview_config.forceLocaleTo || "en");
			
			var resource = preload_resource;
			
			var keyValue;
			if(resource.format == "map"){
				keyValue = "{\"package_id\":\"" + resource.package_id + 
					"\", \"id\":\"" + resource.id + 
					"\", \"pname\":\"" + resource.pname + 
					"\", \"format\":\"" + resource.format + 
					"\", \"map_config\":" + resource.map_data + 
					"}";
				keyValue = escape(keyValue);
			}else if(package_wms_list){
			    // //////////////////////////////////////////////////////////
				// Provides support for Time Intervals 
				// (if available for the WMS resource) in embedded preview
				// //////////////////////////////////////////////////////////
				for(var i=0; i<package_wms_list.length; i++){
					var item = package_wms_list[i];
					if(item.id == resource.id && item.time_interval){
						resource.timeInterval = item.time_interval;
					}
				}	
			}
			
			var url = resource.url;
			
			var capabilitiesUrl = this.getCapabilitiesURL(url);
			
			$("#mapstore-preview").empty();
	
			var config = preview_config;
			var mapstoreBaseURL = config.mapStoreBaseURL;
			
			// ////////////////////////////////////////////////////
			// Set URL used for the preview map button (composer)
			// ////////////////////////////////////////////////////
			var composerURLParams = this.buildUrlParams("composer", capabilitiesUrl, resource, url);
			var src =  "'" + mapstoreBaseURL + config.composerPath + "?" + composerURLParams.join("&") + "'";
			
			mp = this;
			if(keyValue){
				$("#mapstore-preview").append($("<div id=\"previewButton\" class='show-btn'><a id='showInTab' class='show show-primary' onClick=\"javascript:mp.showComposer(" + src + ", '" + keyValue + "')\" target='_blank'>" + this.msgs.showMapInNewTabBtn + "</a><br/></div>"));
			}else{
				$("#mapstore-preview").append($("<div class='show-btn'><a id='showInTab' class='show show-primary' href=" + src + " target='_blank'>" + this.msgs.showMapInNewTabBtn + "</a><br/></div>"));
			}
					
		    // ///////////////////////////////////////////////////////
			// Set URL for the embedded preview and build the iframe
			// ///////////////////////////////////////////////////////
			var viewerURLParams = this.buildUrlParams("viewer", capabilitiesUrl, resource, url);
			src = mapstoreBaseURL + config.viewerPath + "?" + viewerURLParams.join("&");
						
			// /////////////////////////////////////////////////////////////////////////////////
			// If the resource contains an entire map config we prepare a FORM hidden element 
			// to performa a POST request and inject the map config into MapStore
			// /////////////////////////////////////////////////////////////////////////////////
			if(resource.map_data){							
				var previewButton = $("#previewButton");
				
				var msForm = $("#msForm");
				if(msForm){
					msForm.remove();
				}
				
				previewButton.append($("<form id=\"mapstore-ifame-form\" target=\"mapstore-ifame-name\" method=\"post\" action=\"" + src + "\"><input type=\"hidden\" name=\"data\" value=\"" + keyValue + "\"></form>"));
			}		
			
		    // //////////////////////////////////////////////////
			// Build the Iframe to show the MapStore Viewer
			// //////////////////////////////////////////////////
			$("#mapstore-preview").append($("<iframe name=\"mapstore-ifame-name\"></iframe>").attr("id", "mapstore-ifame"));
			$("#mapstore-ifame").attr("style", "border: none;");
			$("#mapstore-ifame").attr("height", "500");
			$("#mapstore-ifame").attr("width", "100%");
			
			if(resource.map_data){
				msForm = $("#mapstore-ifame-form");
				msForm.submit();
			}else{
				$("#mapstore-ifame").attr("src", src);
			}
        },
		
		/**
		 * Perform the POST http request to show the advanced preview. 
		 */
		showComposer: function(src, storeValue){
			var previewButton = $("#previewButton");
			
			var msForm = $("#msForm");
			if(msForm){
				msForm.remove();
			}
			
			previewButton.append($("<form id=\"msForm\" action='' target=\"submission\" onsubmit=\"window.open('',this.target);return true;\" method=\"post\"><input type=\"hidden\" name=\"data\" value=\"" + storeValue + "\"></form>"));
			
			msForm = $("#msForm");
			msForm.attr("action", src);		
			
			msForm.submit();
		},
		
		/**
		 * Sets locale for internal components
		 */
		setI18N: function(locale){
			this.msgs = eval("this.options.i18n." + locale);
			this.locale = locale;
		},
		
		/**
		 * Parse the WMS GetCapabilities URL 
		 */
		getCapabilitiesURL: function(url){
			var capabilitiesUrl;
			if(url.indexOf('geostore') == -1){
				capabilitiesUrl = mapstore_utils.getCapabilitiesUrl(url);
			}
			
			return capabilitiesUrl;
		},
	
	    /**
		 * Build an array of url params to use for mapstore
		 * template - denote the types of params to use for a specific mapstore template
		 */
		buildUrlParams: function(template, capabilitiesUrl, resource, url){
			var config = preview_config;
			var URLParams = [];		
						
			URLParams.push("locale=" + this.locale);                // TODO: link to the Ckan locale ???
			
			if(template == "viewer" || template == "composer"){
				if(resource.format == "wms" || resource.format == "wmts"){
					URLParams.push("wmsurl=" + capabilitiesUrl);
					URLParams.push("layName=" + resource.name);
					URLParams.push("format=" + resource.format);
					
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
				}else if(resource.format == "mapstore"){
					var pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
					var mHost = pattern.exec(url);
					
					URLParams.push("gsturl=" + encodeURIComponent(mHost[1] + mHost[2] + "/geostore/rest/"));
					URLParams.push("mapId=" + url.split("data/")[1]);
				}
			}
			
			if(template == "viewer"){
				URLParams.push("langSelector=false");
				URLParams.push("config=" + config.viewerConfigName);
				
				// /////////////////////////////////////////////////////////////////
				// Check for temporal extent instant (see above and h.get_wms_list)
				// /////////////////////////////////////////////////////////////////
				if(resource.timeInterval){
					URLParams.push("timeInterval=" + resource.timeInterval);
				}
			}

			return URLParams;
		}
    }
});
