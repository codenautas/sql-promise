"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

var Promises = require('best-promise');

function OpaqueObject() {
    this.internalState = null;
};

sqlPromise.DbConnection = function DbConnection() {
    OpaqueObject.call(this);
};

sqlPromise.DbPreparedQuery = function DbPreparedQuery() {
    OpaqueObject.call(this);
};

sqlPromise.DbQuery = function DbQuery() {
    OpaqueObject.call(this);
}

sqlPromise.DbResult = function DbResult() {
    OpaqueObject.call(this);
}

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
    this.fetchRowByRow=function(query, callbackRowByRow) {
        return Promises.reject("Motor.fetchRowByRow() should return a DbResult");
    };
};


//console.log(new DbQuery().internalState);

// sqlPromise.motorName = 'generic';

// sqlPromise.Connection = function Connection(connOpts, connection, done, motor){
    // this.motor = motor;
    // this.fromPool = connOpts==='pool';
    // var self = this;
    // var assignFunctionsPostConnect = function assignFunctionsPostConnect(){
        // existing functions
        // self.done = function(){
            // if(motor.debug.pool){
                // motor.debug.pool[connection.secretKey].count--;
            // }
            // return done.apply(connection,arguments);
        // };
        // self.query = function query(){
            // if(motor.log){
                // var sql=arguments[0];
                // motor.log('------');
                // if(arguments[1]){
                    // motor.log('-- '+sql);
                    // motor.log('-- '+JSON.stringify(arguments[1]));
                    // for(var i=1; i<=arguments[1].length; i++){
                        // var valor=arguments[1][i-1];
                        // if(typeof valor === 'string'){
                            // valor="'"+valor.replace(/'/g,"''")+"'";
                        // }
                        // sql=sql.replace(new RegExp('\\$'+i+'\\b'), valor);
                    // }
                // }
                // motor.log(sql+';');
            // }
            // var internalCursor = motor.getQuery(connection, arguments);
            // return new motor.Query(internalCursor, self);
        // };
    // };
    // motor.allowAccessInternalIfDebugging(self, {connection:connection, pool:this.fromPool, done:done});
    // if(motor.debug.pool && this.fromPool){
        // if(motor.debug.pool===true){
            // motor.debug.pool={};
        // }
        // if(!(connection.secretKey in motor.debug.pool)){
            // motor.debug.pool[connection.secretKey] = {connection:connection, count:0};
        // }
        // motor.debug.pool[connection.secretKey].count++;
    // }
    // assignFunctionsPostConnect();
// };

// sqlPromise.Query = function Query(query, connection){
    // var self = this;
    // connection.motor.allowAccessInternalIfDebugging(self, {query: query, connection:connection});
    // this.execute = function execute(callbackForEachRow, adapterName){
        // connection.motor.log('Query.execute');
        // if(callbackForEachRow && !(callbackForEachRow instanceof Function)){
            // if(adapterName){
                // return Promises.reject(new Error("Query.execute() must recive optional callback function and optional adapterName"));
            // }
            // adapterName=callbackForEachRow;
            // callbackForEachRow=null;
        // }
        // var adapter = connection.motor.queryAdapters[adapterName||'normal'];
        // return connection.motor.makePromiseFetcher(query, callbackForEachRow, function(resolve,reject){
            // return function(result){
                // result.connection = connection;
                // if(connection.motor.log){
                    // connection.motor.log('-- '+JSON.stringify(result.rows));
                // }
                // adapter(result, resolve, reject);
            // }
        // });
    // };
    //new functions
    // this.fetchOneRowIfExists = this.execute.bind(this,'upto1');
    // this.fetchUniqueRow      = this.execute.bind(this,'row');
    // this.fetchUniqueValue    = this.execute.bind(this,'value');
    // this.fetchAll            = this.execute.bind(this,'normal');
    // this.fetchRowByRow       = function fetchRowByRow(callback){
        //connection.motor.log('Query.onRow');
        // if(!(callback instanceof Function)){
            // var err=new Error('fetchRowByRow must recive a callback that executes for each row');
            // err.code='39004!';
            // return Promises.reject(err);
        // }
        // return this.execute(callback);
    // };
    // this.onRow = this.fetchRowByRow;
    // /* why this then function is needed?
     // *   pg.Client.query is synchronic (not need to recive a callback function) then not need to return a Promise
     // *   but pg-promise-strict always returns a "theneable". Then "then" is here. 
     // */
    // if(connection.motor.easy){
        // this.then = function then(callback,callbackE){
            // delete this.then;
            // delete this.catch;
            // return this.execute().then(callback,callbackE);
        // };
    // }
// };

// sqlPromise.buildQueryCounterAdapter = function buildQueryCounterAdapter(minCountRow, maxCountRow, expectText, callbackOtherControl){
    // return function queryCounterAdapter(result, resolve, reject){ 
        // if(result.rows.length<minCountRow || result.rows.length>maxCountRow ){
            // var err=new Error('query expects '+expectText+' and obtains '+result.rows.length+' rows');
            // err.code='54011!';
            // reject(err);
        // }else{
            // if(callbackOtherControl){
                // callbackOtherControl(result, resolve, reject);
            // }else{
                // result.row = result.rows[0];
                // delete result.rows;
                // resolve(result);
            // }
        // }
    // };
// }

// sqlPromise.queryAdapters = {
    // normal: function normalQueryAdapter(result, resolve/*, reject*/){ 
        // resolve(result);
    // },
    // upto1:sqlPromise.buildQueryCounterAdapter(0,1,'up to one row'),
    // row:sqlPromise.buildQueryCounterAdapter(1,1,'one row'),
    // value:sqlPromise.buildQueryCounterAdapter(1,1,'one row (with one field)',function(result, resolve, reject){
        // if(result.fields.length!==1){
            // var err=new Error('query expects one field and obtains '+result.fields.length);
            // err.code='54U11!';
            // reject(err);
        // }else{
            // var row = result.rows[0];
            // result.value = row[result.fields[0].name];
            // delete result.rows;
            // resolve(result);
        // }
    // })
// };

// sqlPromise.allowAccessInternalIfDebugging = function allowAccessInternalIfDebugging(self, internals){
    // if(this.debug[self.constructor.name]){
        // self.internals = internals;
    // }
// };

module.exports = sqlPromise;