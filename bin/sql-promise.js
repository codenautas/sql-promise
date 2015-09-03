"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

sqlPromise.motorName = 'generic';

sqlPromise.Connection = function Connection(connOpts, connection, done, motor){
    this.motor = motor;
    this.fromPool = connOpts==='pool';
    var self = this;
    var assignFunctionsPostConnect = function assignFunctionsPostConnect(){
        // existing functions
        self.done = function(){
            console.log('Connection.done',motor.motorName,!!motor.debug.pool);
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
            var queryArguments = arguments;
            var returnedQuery = connection.query.apply(connection,queryArguments);
            return new motor.Query(returnedQuery, self);
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

sqlPromise.allowAccessInternalIfDebugging = function allowAccessInternalIfDebugging(self, internals){
    if(this.debug[self.constructor.name]){
        self.internals = internals;
    }
};

module.exports = sqlPromise;