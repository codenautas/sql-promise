"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

var Promises = require('best-promise');

sqlPromise.register = function register(motorName, motor){
    this.motors = this.motors || {};
    this.motors[motorName] = motor;
}

sqlPromise.connect = function connect(connOpts){
    var sqlLib = this;
    var motor = this.motors[connOpts.motor];
    return Promises.start(function(){
        return motor.connect(connOpts);
    }).then(function(internal){
        return new sqlLib.Connection(sqlLib, internal, motor);
    });
}

sqlPromise.Connection = function Connection(sqlLib, internal, motor) {
    this.prepare = function prepare(sqlSentence){
        return Promises.start(function(){
            return motor.prepare(internal, sqlSentence);
        }).then(function(internalPreparedQuery){
            return new sqlLib.PreparedQuery(sqlLib, internalPreparedQuery, motor);
        });
    }
    // shortcuts:
    this.query = function query(sqlSentence, data){
        return this.prepare(sqlSentence).then(function(preparedQuery){
            return preparedQuery.query(data);
        });
    }
};

sqlPromise.PreparedQuery = function PreparedQuery(sqlLib, internal, motor) {
    this.query = function query(data){
        return Promises.start(function(){
            return motor.query(internal, data);
        }).then(function(internalQuery){
            return new sqlLib.Query(sqlLib, internalQuery, motor);
        });
    }
};

sqlPromise.Query = function Query(sqlLib, internal, motor) {
    this.fetchAll = function fetchAll(){
        return Promises.start(function(){
            return motor.fetchAll(internal);
        }).then(function(result){
            return result;
        });
    }
};

sqlPromise.Motor = function Motor() {
    this.connect=function(params) {
        return Promises.reject("Motor.connect() should return a DbConnection");
    };
    this.prepare=function(con, sql) {
        return Promises.reject("Motor.prepare() should return a DbPreparedQuery");
    };
    this.query=function(preparedQuery, data) {
        return Promises.reject("Motor.prepare() should return a DbQuery");
    };
    this.fetchAll=function(query) {
        return Promises.reject("Motor.fetchAll() should return a DbResult");
    };
};

module.exports = sqlPromise;