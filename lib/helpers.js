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

// Create random string from numbers end letters of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength ? strLength : false
    if (strLength) {

        // Define all possible characters
        let allPossibleCharacters = 'abcdefgijhklmnoprstuwxyz0123456789'

        let str = ''
        for( i = 1; i <= strLength; i ++) {
            // Create random character
            let randomCharacter = allPossibleCharacters.charAt(Math.floor(Math.random() * allPossibleCharacters.length))
            // Append it to final string
            str += randomCharacter
        }
        return str
    }else{
        return false
    }
}




// Export helper container
module.exports = helpers;