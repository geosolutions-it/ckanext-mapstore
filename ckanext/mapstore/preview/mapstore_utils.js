var mapstore_utils = {

	defaultVersion: "1.1.1",
		
	getCapabilitiesUrl: function(server, version){

		var version = version || this.defaultVersion;

		if (server.indexOf("?") === -1)
			server += "?"

		var url  = server +
				   "SERVICE=WMS" +
				   "&REQUEST=GetCapabilities" +
				   "&VERSION=" + version;

		return encodeURIComponent(url)
	},

	cleanUrl: function(server){
		var qs;
		if (server.indexOf("?") !== -1){
			parts = server.split("?");
			server = parts[0];
			qs = parts[1];
		}

		return server;
	}
	
}