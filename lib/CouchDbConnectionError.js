
var util = require('util');

exports.create = function(url, cause) {
	var error = new Error();
	error.name = "CouchDbConnectionError";
	error.message = util.format("Couldn't connect to your CouchDB at [%s]!",
		url);

	if(cause) {
		error.message = util.format("%s\nCaused by: %s",
			error.message, cause.message
		);
	}

	return error;
}

