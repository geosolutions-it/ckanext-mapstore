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
			
			var URLParams = [];			
			URLParams.push("locale=en");                // TODO: link to the Ckan locale ???
						
			if(capabilitiesUrl){
				URLParams.push("wmsurl=" + capabilitiesUrl);
				URLParams.push("layName=" + resource.name);
			}else{
				URLParams.push("mapId=" + url.split("=")[1]);
			}
					
			/*<a class="btn btn-primary resource-url-analytics resource-type-file" href="http://demo1.geo-solutions.it/geoserver-enterprise/wms">*/
			
			var src =  "'" + mapstoreBaseURL + config.composerPath + "?" + URLParams.join("&") + "'";
			$("#mapstore-preview").append($("<div class='show-btn'><a class='show show-primary' href=" + src + " target='_blank'>Show Map in a new Tab</a><br/></div>"));
			
			URLParams.push("langSelector=false");
			URLParams.push("config=" + config.viewerConfigName);
			
			src = mapstoreBaseURL + config.viewerPath + "?" + URLParams.join("&");
						
			$("#mapstore-preview").append($("<iframe></iframe>").attr("id", "mapstore-ifame"));
			$("#mapstore-ifame").attr("style", "border: none;");
			$("#mapstore-ifame").attr("height", "450");
			$("#mapstore-ifame").attr("width", "100%");
			$("#mapstore-ifame").attr("src", src);
			
        }
    }
});
