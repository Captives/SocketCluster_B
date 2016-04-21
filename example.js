var crypto = require('crypto');
var sha256 = require('sha256');

console.log(sha256('123456'));
console.log(crypto.createHash('md5').update('123456').digest('hex'));