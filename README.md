CouchJob
=========

CouchJob executes JavaScript code from a CouchDB instance on your local
machine. In essence, it brings background jobs to CouchApp.

  - Deploy your job's code together with your CouchApp.
  - Run CouchJob on your local machine, e.g. as cronjob.
  - `require()`-ing server side scripts enabled!

More documentation is soon to come.
    

Build Status
------------

[![Build Status](https://travis-ci.org/fxnn/node-couchjob.png?branch=master)](https://travis-ci.org/fxnn/node-couchjob) [![Dependency Status](https://gemnasium.com/fxnn/node-couchjob.png)](https://gemnasium.com/fxnn/node-couchjob)


Installation
------------

This is not yet published as NPM package, so for now you got to

    git clone git@github.com:fxnn/node-couchjob.git
    npm test
    npm install
    
    
Usage
-----

You can use it from the commandline, just execute the

    couchjob
    
binary for usage information. You may also

    var CouchJob = require('couchjob');
    new CouchJob('http://localost:5984', 'database_name', 'design_doc_name').run(
        'module_name.js', function(err, module_exports) { /* ... */ }
    );
    

Security
--------

When remote code is executed on the local machine, it's always better to think twice.
Basically, you should **only execute trusted code** from **trusted databases** with CouchJob.

That being said, it should always considered possible that your CouchDB gets hacked and the attacker
is able to execute arbitrary code via CouchJob on all machines accessing the CouchDB in question.

To prevent this, we'll rely on the good old **principle of small interfaces**, which will some day
include

 * restriction of the CouchDB instances, the databases, the design documents and the scripts that might
   be executed via configuration files, so that an attacker would need write access to your file system
   to execute remote code (cf. issue #1),
 * restriction of the modules that might get `require()`d by remote Node.js scripts (cf. issue #2),
 * restriction of runtime information that is provided to remote Node.js scripts (cf. issue #3).


    
Dependencies
------------

Special thanks go to the authors of following libraries and frameworks:

 * [couchdb-api](https://github.com/dominicbarnes/node-couchdb-api)
 * [cradle](https://github.com/cloudhead/cradle)
 * [fibers](https://github.com/laverdet/node-fibers)
 * [mocha](https://github.com/visionmedia/mocha)
 * [needy](https://github.com/BlueJeansAndRain/needy)
 * [optimist](https://github.com/substack/node-optimist)
 * [should](https://github.com/visionmedia/should.js)


License (MIT)
-------------

Copyright 2014 Felix Neumann (http://fxnn.de)

This project is free software released under the MIT/X11 license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

