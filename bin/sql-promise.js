"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

var Promises = require('best-promise');

sqlPromise.motorName = 'generic';

sqlPromise.Connection = function Connection(connOpts, connection, done, motor){
    this.motor = motor;
    this.fromPool = connOpts==='pool';
    var self = this;
    var assignFunctionsPostConnect = function assignFunctionsPostConnect(){
        // existing functions
        self.done = function(){
            if(motor.debug.pool){
                motor.debug.pool[connection.secretKey].count--;
            }
            return done.apply(connection,arguments);
        };
        self.query = function query(){
            if(motor.log){
                var sql=arguments[0];
                motor.log('------');
                if(arguments[1]){
                    motor.log('-- '+sql);
                    motor.log('-- '+JSON.stringify(arguments[1]));
                    for(var i=1; i<=arguments[1].length; i++){
                        var valor=arguments[1][i-1];
                        if(typeof valor === 'string'){
                            valor="'"+valor.replace(/'/g,"''")+"'";
                        }
                        sql=sql.replace(new RegExp('\\$'+i+'\\b'), valor);
                    }
                }
                motor.log(sql+';');
            }
            var internalCursor = motor.getQuery(connection, arguments);
            return new motor.Query(internalCursor, self);
        };
    };
    motor.allowAccessInternalIfDebugging(self, {connection:connection, pool:this.fromPool, done:done});
    if(motor.debug.pool && this.fromPool){
        if(motor.debug.pool===true){
            motor.debug.pool={};
        }
        if(!(connection.secretKey in motor.debug.pool)){
            motor.debug.pool[connection.secretKey] = {connection:connection, count:0};
        }
        motor.debug.pool[connection.secretKey].count++;
    }
    assignFunctionsPostConnect();
};

sqlPromise.Query = function Query(query, client){
    var self = this;
    client.motor.allowAccessInternalIfDebugging(self, {query: query, client:client});
    this.execute = function execute(callbackForEachRow, adapterName){
        // client.motor.log('Query.execute');
        if(callbackForEachRow && !(callbackForEachRow instanceof Function)){
            if(adapterName){
                return Promises.reject(new Error("Query.execute() must recive optional callback function and optional adapterName"));
            }
            adapterName=callbackForEachRow;
            callbackForEachRow=null;
        }
        var adapter = client.motor.queryAdapters[adapterName||'normal'];
        return Promises.make(function(resolve, reject){
            query.on('error',function(err){
                reject(err);
            });
            query.on('row',function(row, result){
                if(callbackForEachRow){
                    callbackForEachRow(row, result);
                }else{
                    result.addRow(row);
                }
            });
            query.on('end',function(result){
                result.client = client;
                if(client.motor.log){
                    client.motor.log('-- '+JSON.stringify(result.rows));
                }
                adapter(result, resolve, reject);
            });
        });
    };
    // new functions
    this.fetchOneRowIfExists = this.execute.bind(this,'upto1');
    this.fetchUniqueRow      = this.execute.bind(this,'row');
    this.fetchUniqueValue    = this.execute.bind(this,'value');
    this.fetchAll            = this.execute.bind(this,'normal');
    this.fetchRowByRow       = function fetchRowByRow(callback){
        // client.motor.log('Query.onRow');
        if(!(callback instanceof Function)){
            var err=new Error('fetchRowByRow must recive a callback that executes for each row');
            err.code='39004!';
            return Promises.reject(err);
        }
        return this.execute(callback);
    };
    this.onRow = this.fetchRowByRow;
    /* why this then function is needed?
     *   pg.Client.query is synchronic (not need to recive a callback function) then not need to return a Promise
     *   but pg-promise-strict always returns a "theneable". Then "then" is here. 
     */
    if(client.motor.easy){
        this.then = function then(callback,callbackE){
            delete this.then;
            delete this.catch;
            return this.execute().then(callback,callbackE);
        };
    }
};

sqlPromise.allowAccessInternalIfDebugging = function allowAccessInternalIfDebugging(self, internals){
    if(this.debug[self.constructor.name]){
        self.internals = internals;
    }
};

module.exports = sqlPromise;