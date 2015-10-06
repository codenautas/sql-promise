"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

var Promises = require('promise-plus');

sqlPromise.register = function register(motorName, motor){
    this.motors = this.motors || {};
    this.motors[motorName] = motor;
};

sqlPromise.Query = function Query(sqlLib, internal, motor) {
    this.fetchRowByRow = function fetchRowByRow(consumerFunction){
        return Promises.make(function(resolve, reject){
            motor.fetchRowByRow(internal, {
                onRow:consumerFunction,
                onEnd:resolve,
                onError:reject
            });
        });
    };
    this.fetchAll = function fetchAll(){
        return Promises.start(function(){
            return motor.fetchAll(internal);
        }).then(function(result){
            return result;
        });
    };
    function Result(minRowCount, maxRowCount) {
        this.minRowCount = minRowCount;
        this.maxRowCount = maxRowCount;
    }
    function createUniqueFetcher(name, result, setValue, resolve, reject) {
        function failWithError(reject) {
            var er = new Error("ERROR sql-promise."+name);
            er.notUnique = true;
            reject(er);
        }
        var fetcher = {};
        result.data = null;
        result.rowCount = 0;
        fetcher.onRow = function(res) {
            ++result.rowCount;
            if(result.rowCount>result.maxRowCount) { failWithError(reject); }
            result.data = setValue(res);
        };
        fetcher.onEnd = function() {
            if(result.rowCount<result.minRowCount) {
                failWithError(reject);
            }
            else {
                var res = result.data;
                if(!res) { res = {}; }
                if(result.minRowCount===0) {
                    res.rowCount = result.rowCount;                    
                }
                resolve(res);
            }
        };
        return fetcher;
    }
    function makeFetcherPromise(name, result, setValue) {
        return Promises.make(function(resolve, reject){
            var fetcher=createUniqueFetcher(name, result, setValue, resolve, reject);
            motor.fetchRowByRow(internal, {
                onRow:fetcher.onRow,
                onEnd:fetcher.onEnd,
                onError:reject
            });
        });
    }
    this.fetchUniqueRow = function fetchUniqueRow() {
        return makeFetcherPromise('fetchUniqueRow', new Result(1,1), function(res) { return { row:res }; });
    };
    this.fetchUniqueValue = function fetchUniqueValue() {
        return makeFetcherPromise('fetchUniqueValue', new Result(1,1),
                                  function(res) {
                                      /*jshint forin: false */
                                      for(var nm in res) { return {value: res[nm]}; }
                                      /*jshint forin: false */
                                  });
    };
    this.fetchOneRowIfExists = function fetchOneRowIfExists() {
        return makeFetcherPromise('fetchOneRowIfExists', new Result(0,1), function(res) { return {row: res }; });
    };
    this.execute = function execute() {
        var me = this;
        return Promises.start(function() {
            if(motor.execute && typeof(motor.execute)=='function') {
                return motor.execute(internal);
            } else {
                return me.fetchAll();
            }
        }).then(function(res) {
            return {rowCount:res.rowCount}; 
        });
    };
};
sqlPromise.Query.exposes={};
sqlPromise.Query.exposes.fetchAll={returns:Object};
sqlPromise.Query.exposes.fetchRowByRow={returns:Object};
sqlPromise.Query.exposes.fetchUniqueRow={returns:Object};
sqlPromise.Query.exposes.fetchUniqueValue={returns:Object};
sqlPromise.Query.exposes.fetchOneRowIfExists={returns:Object};
sqlPromise.Query.exposes.execute={returns:Object};

sqlPromise.PreparedQuery = function PreparedQuery(sqlLib, internal, motor) {
    this.query = function query(data){
        return Promises.plus(
            sqlLib.Query,
            Promises.start(function(){
                return motor.query(internal, data);
            }).then(function(internalQuery){
                return new sqlLib.Query(sqlLib, internalQuery, motor);
            })
        );
    };
};
sqlPromise.PreparedQuery.exposes={};
sqlPromise.PreparedQuery.exposes.query={returns:sqlPromise.Query};

sqlPromise.Connection = function Connection(sqlLib, internal, motor) {
    this.prepare = function prepare(sqlSentence){
        return Promises.plus(
            sqlLib.PreparedQuery,
            Promises.start(function(){
                return motor.prepare(internal, sqlSentence);
            }).then(function(internalPreparedQuery){
                return new sqlLib.PreparedQuery(sqlLib, internalPreparedQuery, motor);
            })
        );
    };
    this.done = function done(){
        return motor.done(internal);
    };
    shortcuts:
    this.query = function query(sqlSentence, data){
        return Promises.plus(
            sqlLib.Query,
            this.prepare(sqlSentence).then(function(preparedQuery){
                return preparedQuery.query(data);
            })
        );
    };
    this.placeHolder = function placeHolder(n){
        return motor.placeHolder(n);
    };
    this.execute = function execute(sqlsentence, data) {
        return this.query(sqlsentence, data).then(function(qry){
            return qry.execute();
        });
    };
};
sqlPromise.Connection.exposes={};
sqlPromise.Connection.exposes.prepare={returns:sqlPromise.PreparedQuery};
sqlPromise.Connection.exposes.done={};
sqlPromise.Connection.exposes.query={returns:sqlPromise.Query};

sqlPromise.connect = function connect(connOpts){
    var sqlLib = this;
    var motor = this.motors[connOpts.motor];
    return Promises.plus(
        sqlLib.Query,
        Promises.start(function(){
            return motor.connect(connOpts);
        }).then(function(internal){
            return new sqlLib.Connection(sqlLib, internal, motor);
        })
    );
};
sqlPromise.connect.returns = sqlPromise.Connection;

module.exports = sqlPromise;