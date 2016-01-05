# appio
A Toolkit for distributed stream processing in nodejs and the browser.

## Introduction
The package makes it easy to leverage the nodejs stream abstractions for
implementing distributed data processing pipelines. i.e Data processing in the
large.

With Appio, processing pipelines are made of Connectors, Processing Elements and
Adapters. Connectors connect processing elements to message delivery mechanisms
whilst processing elements implement messaging patterns and semantics. Adapters 
transform messages between one connector or processing element and another 
connector or processing element.

### Connectors
Connectors are duplex streams that adapt messages between appio components and a 
message delivery mechanism like Amqplib or socket.io. A connector, as in the 
illustration below has a readable stream (``a``) and a writable stream (``b``).


					 __________
					|			|
					|	M	 ___|___
					|	E	|	C	|
					|	S	|	O	|--> b
					|	S	|	N	|
					|	A	|	N	|
					|	G	|	E	|
					|	E	|	C	|
					|		|	T	|
					|		|	O	|
					|	B	|	R	|<-- c
					|	U	|_______|
					|	S		|
					|___________|


### Processing elements
A processing element is a duplex stream that implements messaging patterns and
semantics. It provides the API for implementing commands(request-respond), 
queries, change feeds, publish-subscribe, heartbeats et cetera.

							 ___|___
							|		(O--COMMAND1
							|	P	|
							|	R	|
						a-->|	O	(O--DATASET
							|	C	|
							|	E	|
							|	S	(O--CHANGE FEED
							|	S	|
							|	I	(O--MESSAGE PROCESSING
							|	N	|			.
							|	G	|			.
							|		|			.
							|	E	|			.
							|	L	|			.
							|	E	|			.
							|	M	(O--COMMAND2
						b<--|	E	|			.
							|	N	|			.
							|	T	|
							|_______|


### Adapter
An Adapter can be visualized as a double duplex stream implemented by 
2 transform streams as illustrated below.

						 _______
						|		|
				   a -->| -T1-  |--> b
						|		|
						|		|
				   d <--| -T2-	|<-- c
						|_______|

Transform stream ``T1`` transforms data from ``a`` to ``b`` whilst ``T2`` 
transforms data from ``c`` to ``d``. Streams ``a`` and ``d`` are the writable 
and readable ends of a single duplex stream, whilst ``b`` and ``c`` are the ends
of another duplex stream.

Please visit the project [wiki] for more information

## Getting started

Install ``appio`` in your application server:
```
npm install --save appio
```

For browser applications, Install ``appio`` using bower. Include the appio 
script in your html file; - A global variable ``Appio`` will be exposed.
```
bower install --save appio
```
```
<script src="/appio/appio-client-socketio"></script>
```
### A sample microservice

```
var appio = require('appio')('myservice');

//appio to amqp connector package
var appioAmqp = require('appio-connect-amqp')({
	host: '127.0.0.1',
	port: '5672',
});
appioAmqp.pipe(appio).pipe(appioAmqp);

// say hello
appio.fulfill('myservice.hello', function(params, cb){
	return cb(null, 'Hello ' + params.name);
});

appio.dataset('myservice.dataset1')
	.query(function(params, qio){
		db.query(params, function(meta, records){
			qio.meta(meta);
			records.forEach(function(r){
				qio.data.write(r);
			});
			qio.end();
		});
	})
	.changeFeed(function(params, qio){
		db.watch(params, function(changeSpec){
			qio.changes.write(changeSpec);
		});
	});
```

### A sample client in another service
```
var appio = require('appio')('myotherservice');

//appio to amqp connector package
var appioAmqp = require('appio-connect-amqp')({
	host: '127.0.0.1',
	port: '5672',
});
appioAmqp.pipe(appio).pipe(appioAmqp);

// say hello
appio.request('myservice.hello',{name: 'John Doe'} function(err, greeting){
	console.log(greeting); //logs 'Hello John Doe'
});
```

### A browser client
```
var appio = new Appio({
	url: 'server hostname',
	path: '/app path name'
});

// say hello
appio.request('myservice.hello',{name: 'John Doe'} function(err, greeting){
	alert(greeting); //pops up 'Hello John Doe'
});
```

### An example web application server
```
//appio to amqp connector package
var appioAmqp = require('appio-connect-amqp')({
	host: '127.0.0.1',
	port: '5672',
});

var sio = socketio({path:'/my-app'});
var AppioSio = require('appio-socketio');
var aioWs = new AppioSio(sio);

appioAmqp.pipe(appio).pipe(appioAmqp);
var AppioAmqp = require('appio-amqp');
var socketio = require('socket.io');
var through = require('through2');
var auth = require('some-auth library');

var aioAmqp = new AppioAmqp({
	host: '127.0.0.1',
	port: '5672'
});

var authorize = through({objectMode:true}, function(msg, done){
	//put code to authorize the message here
}));

var filter = through({objectMode:true}, function(msg, done){
	//put code to filter here
});

aioWs
	.pipe(authorize)
	.pipe(aioAmqp)
	.pipe(filter)
	.pipe(aiows);

// to treat certain topics specially we can write
aioWs.readable('appio.login').pipe(through2({objectMode:true}, function(msg, done){
	//Authenticate credentials and save user to session
	auth(function(err, user){
		if(err){
			//send error message to 
			aioWs.writeToTopic('appio.login.reply', {
				status: 500,
				description: 'forbidden'			
			});
		}
		
		if(!user){
			//Respond with forbidden message to 
			aioWs.writeToTopic('appio.login.reply', {
				status: 403,
				description: 'forbidden'			
			});
		}
	})
	// push success message through here
	//send response message here
	aioWs.writeable('appio.login.reply').write({
		body:{
			status:200,
			data:{
				name: 'John Doe',
				privileges:['Dataset1 admin']			
			}
		}
	});
}));

```

## Api

### Appio#connect(source, sink)

### Appio.request(commandName, params, cb)
### Appio.fulfill(commandName, cb);
### Appio.query(datasetName, params, cb);
	- cb(qio)
### Appio.dataset(datasetName).query(cb);
	- cb(params, qio);
### Appio.watch(datasetName, params, cb)
	- cb(qio)
### Appio.dataset(datasetName).changeFeed(cb)
	- cb(qio)
