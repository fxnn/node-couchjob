
var should = require('should')


describe('CouchJob CLI', function() {
	it('should show a usage description', function(done) {
		whenCouchJob(function(output, code) {
			output.should.match(/Usage/)

			done()
		})
	})

	it('should fail when invoked with no args', function(done) {
		whenCouchJob(function(output, code) {
			code.should.not.eql(0)

			done()
		})
	})

	it('should succeed when invoked with enough args', function(done) {
		whenCouchJob('--database couchjob_test --ddoc hello --module world.js', function(output, code) {
			output.should.match(/Hello, world!/)
			code.should.eql(0)

			done()
		})
	})
			
})



function whenCouchJob(args, cb){
	var cb = cb || args;
	if (typeof args === 'function') {
		args = '';
	}

	require('child_process').exec('./couchjob.js ' + args,
		function(result, stdout, stderr) {
			cb(stdout + '\n' + stderr, result ? result.code : 0);
		}
	);
}

