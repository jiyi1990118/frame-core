load(['file:1', 'file:2'], function ($1, $2) {

})

var jsonp = require('../lib/net/jsonp');


function load() {
    var args = [].slice.call(arguments),
        argsLen = arg.length,
        callbackFn,
        fileQueue = [];

    switch (true) {
        case argsLen === 2:
            fileQueue=fileQueue.concat(args[0]);
            callbackFn=args[1];
            break;
        case argsLen > 2:
            argsLen-=1;
            for(var i=0;i<argsLen;i++){
                fileQueue=fileQueue.concat(args[i]);
            }
            callbackFn=args[argsLen];
            break;
        case argsLen === 1:
            callbackFn=args[0];
            break;
    }

    if(typeof callbackFn !== "function"){
        fileQueue=fileQueue.concat(callbackFn);
        callbackFn=function () {};
    }


    
}