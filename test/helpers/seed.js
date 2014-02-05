
var db = new(require('cradle').Connection)().database('couchjob_test');


createDb()


function createDb() {
	db.exists(assertOk(function (exists) {
		if (exists) {
			console.log('INFO Database found')
			createHelloWorld()
		} else {
			console.log('INFO Creating database')
			db.create(assertOk(createHelloWorld))
		}
	}))
}


function createHelloWorld() {
	
	db.save('_design/hello', {}, assertOk(function () {
		console.log('INFO Design document saved.')

		var attachment = {
			name : 'world.js',
			'Content-Type': 'text/plain',
			body : 'console.log("Hello, world!");'
		}

		db.saveAttachment('_design/hello', attachment, assertOk(finish));
	}))

}


function finish() {

	console.log('INFO', "We're all done!");

}


function assertOk(err) {
	if(typeof err === 'function') {
		// first is a callback; our error is the next argument ...

		if(typeof arguments[1] === 'undefined') {
			// ... which is yet to come.
			return function() {
				var args = Array.prototype.slice.call(arguments);
				assertOk.apply(null, [err].concat(args));
			};
		}

		// ... which is already there ...
		assertOk(arguments[1])
		// ... and we call our callback with all the rest.
		err.apply(null, Array.prototype.slice.call(arguments, 2))
	} else if(err) {
		console.error('ERROR', err)
		process.exit(1)
	}
}

