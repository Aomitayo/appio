# appio
A Toolkit for distributed stream processing. Greatly influenced by apache kafka.

## Concepts
When implementing stream processing in the large, we must consider

- Scalabilty
- Partitioning
- Fault tolerance
- Semantics
- Reprocessing/replay
- time

Please visit the project wiki for more information
### Streams
### Processors
### Groups
### Topics
### Partitions
### Adapters

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
<script src="/path to appio script"></script>
```

## Some conventions
Connect appio in the browser to your application server
```
var appio = new Appio({
	url: 'server hostname',
	path: '/app path name'
});
```

Publish a message on a topic
```
appio.writable('a topic name1').write({/*...object properties...*/}).end();
//or
appio.publish('a topic name1', {/*...object properties...*/});
```

Subscribe to messages on a single topic
```
appio.readable('a topic name').read(function(){})
//or
appio.subscribe('topic1', function(msg){
	//handle message
});

```

Subscribe to messages on multiple topics
```
appio.readable(['topic1', 'topic2']).read(function(){})
appio.subscribe(['topic1', 'topic2'], function(msg){
	//handle message
});

```

Invoke a command
```
appio.invoke('app.command1', {/*..params..*/}, function(err, result){});
```

Process a command
```
appio.provideCommand('app.topic1', function(params, cb){
	cb(/*..err, results..*/);
});
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

Process a query
```
appio.provideQuery('app.query.data', function(qio){

});
```

A stream processor/microservice
```
var through = function(cb){
	return require('through2')({objectMode:true}, cb);
};

//Pull messages from a topic
appio.readable('app.topic1')
	//transform message
	.pipe(through(function(msg, done){
		this.push({/*..output message..*/});
	}))
	//emit output(to another topic)
	.pipe(appio.writable('app.topic1.reply'));
```

## An example web application server

Typically, an application server will depend on adapters
```
var AppioAmqp = require('appio-amqp');
var AppioSio = rquire('appio-socketio');
var socketio = require('socket.io');
var through = require('through2');
var auth = require('some-auth library');

var sio = socketio({path:'/my-app'});
var aioWs = new AppioSio(sio);
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


