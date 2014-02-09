
var should = require('should'),
	path = require('path'),
	fs = require('fs');


describe('CouchJob Module', function() {

	it('should return an error when invoked with non-existing server', function(done) {
		var CouchJob = requireCouchJob()

		new CouchJob('http://does.not.exist:12345', 'db', 'ddoc').run('script.js',
			function(err, exports) {
				should.exist(err)
				err.should.be.an.Error
				err.message.should.containEql("Couldn't connect")
				err.message.should.containEql("does.not.exist:12345")

				should.not.exist(exports)

				done()
			}
		)
	})

	it('should return no error when invoked correctly', function(done) {
		whenCouchJob().run('world.js', function(err, exports) {
			should.not.exist(err)

			done()
		})
	})

	it('should return the required modules exports object', function(done) {
		whenCouchJob().run('world.js', function(err, exports) {
			exports.should.be.a.String // because helpers/seed.js says so
			exports.should.eql('Hello, world!')

			done()
		})
	})
			
})


function whenCouchJob() {
	var CouchJob = requireCouchJob();

	// NOTE the helpers/seed.js script to prepare your CouchDB
	return new CouchJob('http://localhost:5984', 'couchjob_test', 'hello');
}

function requireCouchJob(){
	var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
	return require(lib + '/CouchJob.js');
}

