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
					|	S	|	O	|--> a
					|	S	|	N	|
					|	A	|	N	|
					|	G	|	E	|
					|	E	|	C	|
					|		|	T	|
					|		|	O	|
					|	B	|	R	|<-- b
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
var http = require('http');
var socketio = require('socket.io');
var Appio = require('appio');

var httpServer = http.createServer();
var sio = socketio({path:'/my-app'});
sio.attach(httpServer);

// Appio instance
var aio = Appio('myappserver');

//Configure AMQP connector
var appioAmqp = Appio.AmqpConnector({
	host: '127.0.0.1',
	port: '5672',
});

//Configure Socketio connector
var aioWs = Appio.SocketioConnector(sio);

//Wire connectors
aioWs.pipe(aio).pipe(aioWs);
var aioFork = aio.fork();
aioFork.pipe(aioAmqp).pipe(aiofork);


httpServer.listen(process.env.HTTP_PORT || 3000);

```

## Api

### Appio#fork(source, sink)

### Appio.request(commandName, params, cb)
### Appio.fulfill(commandName, cb);
### Appio.query(datasetName, params, cb);
	- cb(qio)
### Appio.watch(datasetName, params, cb)
	- cb(qio)
### Appio.dataset(datasetName).query(cb);
	- cb(params, qio);
### Appio.dataset(datasetName).changeFeed(cb)
	- cb(qio)
