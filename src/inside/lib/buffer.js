/**
 * Created by xiyuan on 15-11-30.
 */

"use strict";
function uint8ArrayToBase64( bytes ) {
    var binary = '';
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
};

function arrayBufferToBase64(buffer){
    return uint8ArrayToBase64(new Uint8Array( buffer ))
};

function uint8ArrayToImage( bytes ,fileName) {
    return 'data:image/' + (fileName||'png').match(/[^\.\s\\\/]+$/) +
        ';base64,'+
        uint8ArrayToBase64(bytes);
};

function arrayBufferToImage(buffer,fileName){
    return uint8ArrayToImage(new Uint8Array( buffer ),fileName);
};

module.exports={
    uint8ArrayToBase64:uint8ArrayToBase64,
    arrayBufferToBase64:arrayBufferToBase64,
    uint8ArrayToImage:uint8ArrayToImage,
    arrayBufferToImage:arrayBufferToImage
}

