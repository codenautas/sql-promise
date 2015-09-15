"use strict";

var sqlPromise=require('..');
var expect = require('expect.js');
var Promises = require('best-promise');
var sinon = require('sinon');

var mockConnectionInternal = {internal:'connnnnnn'};
var mockPreparedInternal = {'internal':'prepppppprprprprprpr'};
var mockQueryInternal = {internal:'queryyyyyyyyyyyyiyiyiyiyiy', internalbis:'2.2.2.2.2'};

var mockMotor={
    connect: sinon.stub().returns(Promises.resolve(mockConnectionInternal)),
    prepare: sinon.stub().returns(Promises.resolve(mockPreparedInternal)),
    query: sinon.stub().returns(Promises.resolve(mockQueryInternal)),
    fetchAll: sinon.stub().returns(Promises.resolve({rowCount:1, rows:[{datum:3}]})),
    mockConnectOptions: {thisOptions:'this_opts'}
};

sqlPromise.register('mock', mockMotor);

describe('sql-promise motor test', function(){
    it('should create a connection', function(done){
        var connOpts = {motor:'mock', param1:1, param2:'two'};
        var prom = sqlPromise.connect(connOpts);
        expect(prom).to.be.a(Promises.Promise);
        prom.then(function(conn){
            expect(conn).to.be.a(sqlPromise.Connection)
            expect(mockMotor.connect.callCount).to.be(1);
            expect(mockMotor.connect.firstCall.args).to.eql([connOpts]);
            var prom = conn.prepare("SELECT 1 + $1 as datum");
            expect(prom).to.be.a(Promises.Promise);
            return prom;
        }).then(function(preparedQuery){
            expect(preparedQuery).to.be.a(sqlPromise.PreparedQuery);
            expect(mockMotor.prepare.callCount).to.be(1);
            expect(mockMotor.prepare.firstCall.args).to.eql([mockConnectionInternal, "SELECT 1 + $1 as datum"]);
            var prom = preparedQuery.query([2]);
            expect(prom).to.be.a(Promises.Promise);
            return prom;
        }).then(function(query){
            expect(query).to.be.a(sqlPromise.Query);
            expect(mockMotor.query.callCount).to.be(1);
            expect(mockMotor.query.firstCall.args).to.eql([mockPreparedInternal, [2]]);
            var prom = query.fetchAll();
            expect(prom).to.be.a(Promises.Promise);
            return prom;
        }).then(function(result){
            expect(mockMotor.fetchAll.callCount).to.be(1);
            expect(mockMotor.fetchAll.firstCall.args).to.eql([mockQueryInternal]);
            expect(result.rows).to.eql([{datum:3}]);
            expect(result.rowCount).to.eql(1);
        }).then(function(){
            done();
        }).catch(done);
    });
});

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
