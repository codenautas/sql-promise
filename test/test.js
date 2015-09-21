"use strict";

var sqlPromise=require('..');
var expect = require('expect.js');
var Promises = require('promise-plus');
var sinon = require('sinon');

var mockConnectionInternal = {internal:'connnnnnn'};
var mockPreparedInternal = {'internal':'prepppppprprprprprpr'};
var mockQueryInternal = {internal:'queryyyyyyyyyyyyiyiyiyiyiy', internalbis:'2.2.2.2.2'};

var auxForFetchRowByRow = [{alfa: 'a', num:1}, {alfa: 'b', num:2}];

var mockMotor={
    connect: sinon.stub().returns(Promises.resolve(mockConnectionInternal)),
    done: sinon.stub().returns(null),
    prepare: sinon.stub().returns(Promises.resolve(mockPreparedInternal)),
    query: sinon.stub().returns(Promises.resolve(mockQueryInternal)),
    fetchAll: sinon.stub().returns(Promises.resolve({rowCount:1, rows:[{datum:3}]})),
    fetchRowByRow: function(internal, funs){
        setTimeout(function(){ funs.onRow(auxForFetchRowByRow[0]); },50);
        setTimeout(function(){ funs.onRow(auxForFetchRowByRow[1]); },150);
        setTimeout(function(){ funs.onEnd({result:'ok'}); },250);
    },
    consumerRowByRow: sinon.spy(),
    placeHolder: sinon.stub().returns(':place'),
    mockConnectOptions: {thisOptions:'this_opts'},
};

sqlPromise.register('mock', mockMotor);

describe('sql-promise motor test', function(){
    it('should create a connection', function(done){
        var connOpts = {motor:'mock', param1:1, param2:'two'};
        var prom = sqlPromise.connect(connOpts);
        expect(prom.__isPromisePlus).to.ok();
        var conn;
        prom.then(function(obtainedConn){
            conn = obtainedConn;
            expect(conn).to.be.a(sqlPromise.Connection)
            expect(mockMotor.connect.callCount).to.be(1);
            expect(mockMotor.connect.firstCall.args).to.eql([connOpts]);
            var prom = conn.prepare("SELECT 1 + $1 as datum");
            expect(prom.__isPromisePlus).to.ok();
            return prom;
        }).then(function(preparedQuery){
            expect(preparedQuery).to.be.a(sqlPromise.PreparedQuery);
            expect(mockMotor.prepare.callCount).to.be(1);
            expect(mockMotor.prepare.firstCall.args).to.eql([mockConnectionInternal, "SELECT 1 + $1 as datum"]);
            var prom = preparedQuery.query([2]);
            expect(prom.__isPromisePlus).to.ok();
            return prom;
        }).then(function(query){
            expect(query).to.be.a(sqlPromise.Query);
            expect(mockMotor.query.callCount).to.be(1);
            expect(mockMotor.query.firstCall.args).to.eql([mockPreparedInternal, [2]]);
            var prom = query.fetchAll();
            expect(prom.then).to.be.a(Function);
            return prom;
        }).then(function(result){
            expect(mockMotor.fetchAll.callCount).to.be(1);
            expect(mockMotor.fetchAll.firstCall.args).to.eql([mockQueryInternal]);
            expect(result.rows).to.eql([{datum:3}]);
            expect(result.rowCount).to.eql(1);
        }).then(function(){
            return conn.placeHolder(3);
        }).then(function(placeHolder){
            expect(placeHolder).to.be(':place');
            expect(mockMotor.placeHolder.callCount).to.be(1);
            expect(mockMotor.placeHolder.firstCall.args).to.eql([3]);
            return conn.query("SELECT x", [1,'alfa']);
        }).then(function(query){
            expect(mockMotor.prepare.callCount).to.be(2);
            expect(mockMotor.prepare.secondCall.args).to.eql([mockConnectionInternal, "SELECT x"]);
            expect(mockMotor.query.callCount).to.be(2);
            expect(mockMotor.query.secondCall.args).to.eql([mockPreparedInternal, [1, 'alfa']]);
            var result_p = query.fetchRowByRow(mockMotor.consumerRowByRow);
            expect(result_p.then).to.be.a(Function);
            return result_p;
        }).then(function(result){
            expect(mockMotor.consumerRowByRow.callCount).to.be(2);
            /*
            expect(mockMotor.consumerRowByRow.firstCall).to.be(auxForFetchRowByRow[0]);
            expect(mockMotor.consumerRowByRow.secondCall).to.be(auxForFetchRowByRow[1]);
            expect(result).to.eql({resultRbR:true});
            */
            return conn.done();
        }).then(function(){
            expect(mockMotor.done.callCount).to.be(1);
            expect(mockMotor.done.firstCall.args).to.eql([mockConnectionInternal]);
        }).then(function(){
            done();
        }).catch(done);
    });
});

