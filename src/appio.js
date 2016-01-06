'use strict';

var _ = require('lodash');
var util = require('util');
var Duplex = require('stream').Duplex;
var ClientPatterns = require('./lib/patterns-client');
var ServerPatterns = require('./lib/patterns-server');
var Adapter = require('./lib/adapter');

module.exports = Appio;

function Appio(name){
	if(!(this instanceof Appio)){
		return new Appio(name);
	}

	Duplex.call(this, {objectMode:true});

	if(!name){
		throw new Error('\'name\' is a required parameter');
	}
	this.name = name;
}

util.inherits(Appio, Duplex);

_.extend(Appio.prototype, ClientPatterns);
_.extend(Appio.prototype, ServerPatterns);
_.extend(Appio.prototype, Adapter);

