
var util = require('util'),
	Needy = require('needy'),
	Fiber = require('fibers'),
	Future = require('fibers/future'),
	CouchDb = require('couchdb-api'), // TODO: Replace by cradle
	CouchDbModuleResolver = require('./CouchDbModuleResolver.js'),
	CouchDbConnectionError = require('./CouchDbConnectionError.js');


module.exports = CouchJob;


/**
 * @param connection Connection to CouchDB, in form protocol://host[:port]
 * @param database Name of database
 * @param ddoc Name of design document
 */
function CouchJob(connection, database, ddoc) {
	this._connection_name = connection;
	this._db_name = database;
	this._ddoc_name = ddoc;

	this._uri_prefix = util.format('couchdb:%s/%s/_design/%s/',
		this._connection_name, this._db_name, this._ddoc_name
	);
}

CouchJob.prototype._resolve_ddoc = function() {
	try {
		var ddoc = CouchDb.srv(this._connection_name)
						  .db(this._db_name)
						  .ddoc(this._ddoc_name);
	} catch(unexpectedError) {
		throw CouchDbConnectionError.create(this._uri_prefix, unexpectedError);
	}

	try {
		var future = new Future;
		ddoc.get(future.resolver());
		future.wait(); // NOTE, that this would throw errors
	} catch(couchDbError) {
		throw CouchDbConnectionError.create(ddoc.url, couchDbError);
	}

	return ddoc;
}

CouchJob.prototype._require_module = function(ddoc, module_name) {
	var module = new Needy({
		resolver: new CouchDbModuleResolver(ddoc, this._uri_prefix)
	}).init(module_name);

	return module;
}

/**
 * @param module_name Name of remote module to run.
 * @param cb Optional callback of type function(err, exports), returning any
 *		caught error object as 1st parameter and the exports object of the
 *		module as 2nd.
 */
CouchJob.prototype.run = function(module_name, cb) {
	var self = this;

	Fiber(function(){
		var err;
		var exports;

		try {
			var ddoc = self._resolve_ddoc();
			var module = self._require_module(ddoc, module_name);

			err = null;
			exports = module.exports;
		} catch(caughtError) {
			err = caughtError;
			exports = null;
		}

		if(typeof cb === 'function') {
			cb(err, exports);
		}
	}).run();
}


