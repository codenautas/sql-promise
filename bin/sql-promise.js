"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

var sqlPromise = {};

sqlPromise.allowAccessInternalIfDebugging = function allowAccessInternalIfDebugging(self, internals){
    if(this.debug[self.constructor.name]){
        self.internals = internals;
    }
};

module.exports = sqlPromise;