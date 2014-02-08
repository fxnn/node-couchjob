
var util = require('util'),
	Needy = require('needy'),
	Fiber = require('fibers'),
	CouchDb = require('couchdb-api'), // TODO: Replace by cradle
	CouchDbModuleResolver = require('./CouchDbModuleResolver.js');


module.exports = CouchJob;


/**
 * @param connection Connection to CouchDB, in form [protocol://]host[:port]
 * @param database Name of database
 * @param ddoc Name of design document
 * @param module File name of module to load and execute
 */
function CouchJob(connection, database, ddoc, module) {
	this._connection = connection;
	this._database = database;
	this._ddoc = ddoc;
	this._module = module;

	this._uri_prefix = util.format('couchdb:%s/%s/_design/%s/',
		this._connection, this._database, this._ddoc
	);
}

CouchJob.prototype.run = function() {
	var self = this;

	// TODO: Error handling?! Callbacks?!
	Fiber(function(){
		console.info('Connecting to CouchDB @ %s/%s', self._connection, self._database);
		var ddoc = CouchDb.srv(self._connection).db(self._database).ddoc(self._ddoc);

		console.info("Starting Module: " + self._module);
		new Needy({
			resolver: new CouchDbModuleResolver(ddoc, self._uri_prefix)
		}).init(self._module);
	}).run();
}

