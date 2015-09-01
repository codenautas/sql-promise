"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromiseTester = {};

var expect = require('expect.js');

sqlPromiseTester.test = function(motor, opts){
    var defaultConnOpts={
        user:'test_user',
        password:'test_pass',
        database:'test_db',
        host:'localhost',
        port:motor.defaultPort
    };
    describe('sql-promise-tester '+motor.name, function(){
        before(function(done){
            if(opts.prepare){
                opts.prepare().then(done,done);
            }else{
                done();
            }
        });
        it('must provide defaultPort', function(){
            expect('defaultPort' in motor).to.be.ok();
        });
        it('connect', function(done){
            motor.connect(opts.connOpts||defaultConnOpts).then(function(){
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
        describe('connectected tests', function(done){
            var conn;
            before(function(done){
                motor.connect(opts.badConnOpts||defaultConnOpts).then(function(obtainedConn){
                    conn=obtainedConn;
                    done();
                }).catch(done);
            });
            it('must create table',function(done){
                var cursor=conn.query("CREATE TABLE example1(id integer primary key, datum text)");
                expect(cursor.execute).to.be.a(Function);
                cursor.execute().then(function(result){
                    console.log('result',result);
                    done();
                }).catch(done);
            })
        });
    });
};

module.exports = sqlPromiseTester;