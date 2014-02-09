
var should = require('should'),
	path = require('path'),
	fs = require('fs'),
	child_process = require('child_process');


describe('CouchJob CLI', function() {
	it('should show a usage description when invoked with no args', function(done) {
		whenCouchJob(function(output, exitcode) {
			output.should.match(/Usage/)

			done()
		})
	})

	it('should fail when invoked with no args', function(done) {
		whenCouchJob(function(output, exitcode) {
			exitcode.should.not.eql(0)

			done()
		})
	})

	it('should display error message when invoked with wrong url', function(done) {
		whenCouchJob('--connection does.not.exist:5984 --database a --ddoc b --module c',
			function(output, exitcode) {
				output.should.match(/Couldn't connect/)
				exitcode.should.not.eql(0)

				done()
			}
		)
	})

	it('should succeed when invoked with correct args', function(done) {
		// NOTE the helpers/seed.js script to prepare your CouchDB

		whenCouchJob('--database couchjob_test --ddoc hello --module world.js', function(output, exitcode) {
			output.should.match(/Hello, world!/)
			exitcode.should.eql(0)

			done()
		})
	})
			
})



function whenCouchJob(args, cb){
	var cb = cb || args;
	if (typeof args === 'function') {
		args = '';
	}

	var bin = path.join(path.dirname(fs.realpathSync(__filename)), '../bin');

	child_process.exec(bin + '/couchjob ' + args,
		function(result, stdout, stderr) {
			cb(stdout + '\n' + stderr, result ? result.code : 0);
		}
	);
}

