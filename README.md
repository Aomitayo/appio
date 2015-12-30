# appio
A Large Scale stream processing toolkit

This toolkit is greatly influenced by apache kafka.

When implementing stream processing on a large scale, a number of issues have
to be considered. They include:

- Scalabilty
- Partitions
- Fault tolerance
- Semantics
- time
- Event reprocessing/replay

Scalabilty is addressed by "service groups"

## Getting started

```
npm install --save appio
```

# An example web application server

```
var appio = require('appio');
var AppioAmqp = require('appio-amqp');
var AppioSio = rquire('appio-socketio');
var socketio = require('socket.io');
var through = require('through2');
var auth = require('some-auth library');

var aioWs = new AppioSio();
var aioAmqp = new AppioAmqp();

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
aioWs.read('appio.login').pipe(through2({objectMode:true}, function(msg, done){
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
	aioWs.write({
		topic:'appio.login.reply',
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

## On the browser

Include the appio client script in your html file. A global variable ``Appio`` 
will be exposed to scripts running in your browser.
```
<script src="/path to appio client"></script>
```

In your script, Connect appio to your application server
```
var appio = new Appio({
	url: 'server hostname',
	path: '/app path name'
});
```

Invoke a command
```
appio.invoke('app.command1', {/*..params..*/}, function(err, result){});
```

Run a query
```
appio.query('app.dataset1', {/*..params..*/}, function(qio){
	//qio is an event emitter with events meta, data, end
	qio.on('meta', function(queryMetadata){});
	qio.on('data', function(queryData));
	qio.on('end', function(){/*..finalize query operation..*/});
});
```

Send a message on a topic
```
appio.topic('a topic name1').write({/*...object properties...*/});
```

Subscribe to message(s) on a topic
```
appio.topic(['topic1', 'topic2']).read(function(msg){
	//handle message
});

```
## Concepts

## Api


