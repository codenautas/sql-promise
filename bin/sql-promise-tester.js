"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromiseTester = {};

var expect = require('expect.js');

sqlPromiseTester.test = function(motor){
    describe('sql-promise-tester '+motor.name, function(){
        it('connect', function(){
            expect("no implementado").to.eql("aun");
        });
    });
};

module.exports = sqlPromiseTester;