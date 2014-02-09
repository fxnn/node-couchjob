
var Needy = require('needy'),
    Future = require('fibers/future');


module.exports = CouchDbModuleResolver;


function CouchDbModuleResolver(ddoc, uri_prefix) {
	this._ddoc = ddoc;
	this._uri_prefix = uri_prefix;
	this._resolver_fallback = new Needy.Resolver({ /* no options */ });
}

Needy.Resolver.extend(CouchDbModuleResolver, {
	resolve : function(module_name, dir_name) {
		var self = this;
		if(dir_name) {
			console.warn("WARN: dirname is not supported! [value = %s]", dir_name);
		}

		var future = new Future;
		self._ddoc.attachment(module_name).get(future.resolver());

		try {
			// NOTE, that errors will be thrown by the wait() function
			var result = future.wait();
			return new Needy.Module(self._uri_prefix + module_name, result);

		} catch(couchDbError) {
			// TODO: Avoid log output on error
			console.warn('HINT: cannot resolve module [%s] on your CouchDB, falling back to local', self._uri_prefix + module_name);
			console.warn('Caused by:\n%s', couchDbError);

			return self._resolver_fallback.resolve(module_name, dir_name);
		}
	}
});

