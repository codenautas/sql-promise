"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromiseTester = {};

var expect = require('expect.js');

sqlPromiseTester.test = function(motor, opts){
    describe('sql-promise-tester '+motor.name, function(){
        it('must provide defaultPort', function(){
            expect('defaultPort' in motor).to.be.ok();
        });
        it('connect', function(done){
            motor.connect(opts.connOpts||{
                user:'test_user',
                password:'test_pass',
                database:'test_db',
                host:'localhost',
                port:motor.defaultPort
            }).then(function(){
                done();
            }).catch(done);
        });
        it('not connect with bad connection parameters', function(done){
            motor.connect(opts.badConnOpts||{
                user:'test_user',
                password:'BAD PASS',
                database:'test_db',
                host:'localhost',
                port:motor.defaultPort
            }).then(function(){
                done(new Error('must not connect'));
            }).catch(function(err){
                done();
            });
        });
    });
};

module.exports = sqlPromiseTester;