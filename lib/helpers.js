/*
* Helpers for various tasks
*
*/

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for all tasks
var helpers = {}

// Create SHA256 hash
helpers.hash=(str)=> {
    if (typeof(str) == 'string' && str.length>0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash;
    }else{
        return false
    }
}

// Parse a JSON string to an object without throwing
helpers.parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str)
        return obj

    }catch(e){
        return {}
    }
}




// Export helper container
module.exports = helpers;