#!/usr/bin/env node

/*
 * CouchJob
 * executes CouchDB-hosted code with Node.js
 *
 * by Felix Neumann <condor@the-contented.de>
 */


if (process.argv.length < 5) {
	console.log("Usage: couchjob [couchdb-name] [design-doc-name] [startup-module-name]");
	process.exit(1);
}

/// config //////

var couchdb_srv = 'http://localhost:5984/';
var couchdb_db = process.argv[2];
var couchdb_ddoc = process.argv[3];
var init_module_name = process.argv[4];

var couchdb_uri_prefix = couchdb_srv + couchdb_db + "/_design/" + couchdb_ddoc + "/";


/// setup //////

var Needy = require('needy'),
	couchdb = require('couchdb-api'),
	Fiber = require('fibers'),
	Future = require('fibers/future');


/// CouchDbModuleResolver //////

function CouchDbModuleResolver(db, ddoc_name) {
	this._designdoc = db.ddoc(ddoc_name);
	this._fallback_resolver = new Needy.Resolver({ /* no options */ });
}

Needy.Resolver.extend(CouchDbModuleResolver, {
	resolve : function(identity, dirname) {
		var self = this;
		if(dirname) {
			console.logger("WARN: dirname is not supported! [value = %s]", dirname);
		}

		var future = new Future;
		self._designdoc.attachment(identity).get(future.resolver());

		try {
			var result = future.wait();
			return new Needy.Module(couchdb_uri_prefix + identity, result);
		} catch(couchDbError) {
			return self._fallback_resolver.resolve(identity, dirname);
		}
	}
});



/// start up //////

Fiber(function(){
	console.info("Connecting to CouchDB @ " + couchdb_srv + couchdb_db);
	var db = require('couchdb-api').srv(couchdb_srv).db(couchdb_db);

	console.info("Starting Module: " + init_module_name);
	var needy = new Needy({resolver: new CouchDbModuleResolver(db, couchdb_ddoc)});

	needy.init(init_module_name)
}).run();



