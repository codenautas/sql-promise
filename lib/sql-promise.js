"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

var Promises = require('promise-plus');

sqlPromise.register = function register(motorName, motor){
    this.motors = this.motors || {};
    this.motors[motorName] = motor;
}

sqlPromise.Query = function Query(sqlLib, internal, motor) {
    this.fetchRowByRow = function fetchRowByRow(consumerFunction){
        return Promises.make(function(resolve, reject){
            motor.fetchRowByRow(internal, {
                onRow:consumerFunction,
                onEnd:resolve,
                onError:reject
            });
        });
    }
    this.fetchAll = function fetchAll(){
        return Promises.start(function(){
            return motor.fetchAll(internal);
        }).then(function(result){
            return result;
        });
    }
    this.fetchUniqueRow = function fetchUniqueRow() {
        var cont=0;
        function failWithError(reject) {
            var er = new Error("ERROR sql-promise.fetchUniqueRow");
            er.notUnique = true;
            reject(er);
        }
        var row=null;
        return Promises.make(function(resolve, reject){
            motor.fetchRowByRow(internal, {
                onRow:function(res) {
                    ++cont;
                    if(cont>1) { failWithError(reject); }
                    row = res;
                },
                onEnd:function() {
                    if(cont<1) { failWithError(reject); }
                    else resolve(row);
                },
                onError:reject
            });
        });
    }
};
sqlPromise.Query.exposes={};
sqlPromise.Query.exposes.fetchAll={returns:Object};
sqlPromise.Query.exposes.fetchRowByRow={returns:Object};
sqlPromise.Query.exposes.fetchUniqueRow={returns:Object};

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
    }
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
    }
    this.done = function done(){
        return motor.done(internal);
    }
    // shortcuts:
    this.query = function query(sqlSentence, data){
        return Promises.plus(
            sqlLib.Query,
            this.prepare(sqlSentence).then(function(preparedQuery){
                return preparedQuery.query(data);
            })
        );
    }
    this.placeHolder = function placeHolder(n){
        return motor.placeHolder(n);
    }
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
}
sqlPromise.connect.returns = sqlPromise.Connection;

module.exports = sqlPromise;