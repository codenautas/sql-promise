"use strict";

var sqlPromise=require('..');
var expect = require('expect.js');
var Promises = require('best-promise');

describe('sql-promise interface tests', function(){
    it('should throw exceptions on unimplemented methods', function(done){
        var motor;
        Promises.start(function() {
            motor= new sqlPromise.Motor();
            return motor.connect();
        }).catch(function(err) {
            expect(err).to.match(/should return a DbConnection/);
            return motor.prepare(); 
        }).catch(function(err) {
            expect(err).to.match(/should return a DbPreparedQuery/);
            return motor.query(); 
        }).catch(function(err) {
            expect(err).to.match(/should return a DbQuery/);
            return motor.fetchRowByRow(); 
        }).catch(function(err) {
            expect(err).to.match(/should return a DbResult/);
            done(); 
        });
    });
});
