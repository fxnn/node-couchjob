#!/usr/bin/env node

/*
 * CouchJob
 * executes CouchDB-hosted code with Node.js
 *
 * by Felix Neumann <condor@the-contented.de>
 */


var argv = require('optimist')
	.usage('Your local Node.js running remote CouchApp code\nUsage: $0')
	.option('connection', {
		alias : 'c',
		default : 'http://localhost:5984',
		describe : '[protocol://]hostname[:port]'})
	.option('database', {
		alias: 'b',
		demand : true,
		describe : 'Database name'})
	.option('ddoc', {
		alias : 'd',
		demand : true,
		describe : 'Design document name'})
	.option('module', {
		alias : 'm',
		demand : true,
		describe : 'Module that contains your code'})
	.argv;


/// config //////

// TODO: Use a REST library where we can just demand a URL?
var couchdb_uri_prefix = require('util').format(
	'couchdb:%s/%s/_design/%s/',
	argv.connection, argv.database, argv.ddoc
);


/// setup //////

var Needy = require('needy'),
	Fiber = require('fibers'),
	Future = require('fibers/future');


/// CouchDbModuleResolver //////

function CouchDbModuleResolver(db, ddoc_name) {
	this._ddoc = db.ddoc(ddoc_name);
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
			var result = future.wait();
			return new Needy.Module(couchdb_uri_prefix + module_name, result);
		} catch(couchDbError) {
			console.warn('HINT: cannot resolve module [%s] on your CouchDB, falling back to local', module_name);
			return self._resolver_fallback.resolve(module_name, dir_name);
		}
	}
});



/// start up //////

Fiber(function(){
	// TODO: Replace couchdb-api by cradle
	console.info('Connecting to CouchDB @ %s/%s', argv.connection, argv.database);
	var db = require('couchdb-api').srv(argv.connection).db(argv.database);

	var needy = new Needy({
		resolver: new CouchDbModuleResolver(db, argv.ddoc)
	});

	console.info("Starting Module: " + argv.module);
	needy.init(argv.module);
}).run();



