var mapstore_utils = {

	defaultVersion: "1.3.0",

	/**
	 * Generate capabilities URL for a server. 
	 * You can force a version by parameter, otherwise, if the server url had version, this one it's kept
	 **/
	getCapabilitiesUrl: function(server, version){

		var forceVersion = !!version;

		var version = version || this.defaultVersion;

		if (server.indexOf("?") === -1)
			server += "?"

		// Replace service, request and version
		var url = server;
		if(url.toLowerCase().indexOf("service=wms") < 0){
			if (url.indexOf('?') != (url.lenght - 1)){
				url += "&";
			}
			url += "SERVICE=WMS";
		}
		if(url.toLowerCase().indexOf("request=getcapabilities") < 0){
			url += "&REQUEST=GetCapabilities";
		}
		if(url.toLowerCase().indexOf("version=") < 0){
			url += "&VERSION=" + version;
		}else if(forceVersion){
			var startVersionIndex = url.toLowerCase().indexOf("version=") + 8;
			var versionTmp = url.substring(startVersionIndex);
			var endVersionIndex = -1;
			if(versionTmp.indexOf("&") > -1){
				endVersionIndex += startVersionIndex + versionTmp.indexOf("&") + 1;
			}
			var tmpUrl = url.substring(0, startVersionIndex) + version;
			if(endVersionIndex > -1){
				tmpUrl += url.substring(endVersionIndex);
			}
			url = tmpUrl;
		}

		return encodeURIComponent(url)
	}
	
}
