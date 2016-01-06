var chai = require('chai');
var expect =  chai.expect;
var Appio = require('../../');

describe('Appio', function(){
	it('Accepts and preserves name parameter in constructor', function(){
		expect(Appio).to.have.length(1);
		expect(new Appio('testing')).to.have.property('name', 'testing');
	});
	
	it('Serves as a factory function', function(){
		expect(Appio('testing')).to.be.an.instanceOf(Appio);
	});
	
	it('Throws an error when a name is not supplied', function(){
		expect(Appio).to.throw(/'name' is a required parameter/);
	});
});

describe('Appio instance', function(){
	var appio = new Appio('test');

	it('Is an instance of a nodejs Duplex stream', function(){
		expect(appio).to.be.an.instanceof(require('stream').Duplex);
	});

	it('Responds request', function(){
		expect(appio).respondsTo('request');
		expect(appio.request).to.have.length(2);
	});

	it('Responds to query', function(){
		expect(appio).to.respondsTo('query');
	});

	it('Responds to watch', function(){
		expect(appio).to.respondsTo('watch');
	});

	it('Responds to fulfill', function(){
		expect(appio).to.respondsTo('fulfill');
	});

	it('Responds to dataset', function(){
		expect(appio).to.respondsTo('dataset');
	});

	it('Responds to fork', function(){
		expect(appio).to.respondTo('fork');
	});
});
