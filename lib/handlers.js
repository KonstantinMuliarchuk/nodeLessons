/*
*Request handlers
*
*/

// Dependencies
var _data = require('./data')
var helpers = require('./helpers')

// Define the handlers 
var handlers = {}

//Sample handler 
handlers.ping = (data, callback) => {

    // callback http code and payload
    callback(200);
}

handlers.hello = (data, callback) => {
    callback(200, { massage: 'Greetings master' })
}

//Not found handler
handlers.notFound = (data, callback) => {

    // not found handler 
    callback(404, {});
}

// User handler
handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete']
    acceptableMethods.includes(data.method)
        ? handlers._users[data.method](data, callback)
        : callback(405)
}

// Container for users sub methods
handlers._users = {}

//Users post
// Required fields : fistName, lastName, phone, password, tosAgreement
//Optional data: none
handlers._users.post = (data, callback) => {
    var firstName = verifyData(data, 'firstName', 0),
        lastName = verifyData(data, 'lastName', 0),
        phone = verifyData(data, 'phone', 10),
        password = verifyData(data, 'password', 5),
        tosAgreement = verifyData(data, 'tosAgreement', true)
    if (firstName && lastName && phone && password && tosAgreement) {
        _data.read('users', phone, (err, data) => {
            if (err) {
                let hashedPassword = helpers.hash(password)
                if (hashedPassword) {
                    // Create user object
                    let userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement: true
                    };
                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        !err
                            ? callback(200)
                            : (console.log(err),
                                callback(500, { Error: 'Can\'t create the new user' }));
                    })
                } else {
                    callback(500, { Error: 'Can\'t hash the user\'s password' })
                }

            } else {
                callback(400, { Error: 'User already exist!' })
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields' });
    }
}

//Users get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access to anyone elses
handlers._users.get = (data, callback) => {
    // Check if phone number is valid
    let phone = typeof (data.queryStringObject.phone) == 'string'
        && data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone.trim()
        : null
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                //Removing the hashed password before returning it to the user
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, { Error: "Missing required field" })
    }
}
//Users put
// Required data: phone
//Optional data: firstName, lastName, password
//  @TODO Only let an authenticated user update their object. Don't let them update to anyone elses
handlers._users.put = (data, callback) => {
    // Check if phone number is valid
    let phone = verifyData(data, 'phone', 10),

        // Check for optional fields
        firstName = verifyData(data, 'firstName', 0),
        lastName = verifyData(data, 'lastName', 0),
        password = verifyData(data, 'password', 5)
    console.log(phone,firstName, lastName, password)
    // Error if phone number not found
    if (phone) {
        if (firstName || lastName || password) {
            _data.read('users', phone, (err, userData) => {
                if (!err, data) {
                    //Updating the fields
                    if (firstName) {
                        userData.firstName = firstName
                    }
                    if (lastName) {
                        userData.lastName = lastName
                    }
                    if (password) {
                        userData.password = helpers.hashedPassword(password)
                    }

                    //Store data to disk
                    _data.update('users', phone, userData, (err) =>{
                        if(!err) {
                            callback(200)
                        }else{
                            callback(500, {Error: 'Could not update the user'})
                        }
                    })
                } else {
                    callback(400, { Error: 'The specified user doesn\'t exist!' })
                }
            })
        } else {
            callback(400, { Error: "Missing fields to update" })
        }
    } else {
        callback(400, { Error: "Missing required field" })
    }
}
//Users delete
//Required data: phone number
//TO DO: Only let authenticated user delete their data^ not let them delete ony ones other!
//TO DO: Delete all files associated with this user 
handlers._users.delete = (data, callback) => {

    // Check if phone number is valid
    let phone = typeof (data.queryStringObject.phone) == 'string'
        && data.queryStringObject.phone.trim().length == 10
        ? data.queryStringObject.phone.trim()
        : null
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (error)=>{
                    if(!error) {
                        callback(200)
                    }else{
                        callback(500, {Error: 'Could not delete specified user!'})
                    }
                })
            } else {
                callback(400, {Error: 'Could not find the specified user!'})
            }
        })
    } else {
        callback(400, { Error: "Missing required field" })
    }
}

// Token handler
handlers.tokens = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete']
    acceptableMethods.includes(data.method)
        ? handlers._tokens[data.method](data, callback)
        : callback(405)
}

// Tokens container
handlers._tokens = {}

// Tokens post
// Required data: phone number and password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    let phone = verifyData(data, 'phone', 10),
    password = verifyData(data, 'password', 5)
    if (phone && password) {
        _data.read('users',phone, (err, userData) => {
            if (!err && userData){
                let hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.hashedPassword) {
                    let id = helpers.createRandomString(20),
                    expired = Date.now() + 1000 * 60 * 60;

                    // Create token data object
                    let tokenData = {
                        id,
                        phone,
                        expired
                    }
                    // Storing tokens object to disk
                    _data.create('tokens', id, tokenData, (err) => {
                        if(!err) {
                            callback(200, tokenData)
                        }else{
                            callback(500, {Error: 'Can not create new token'})
                        }
                    })

                }else{
                    callback(400, {Error: 'Password did not match!'})
                }
            }else{
                callback(400, {Error: 'User not exist'})
            }
        })
    }else{
        callback(400, {Error: 'Missing required field(s)'})
    }
}

// Tokens - get
// Required fields: token ID
// Optional: none
handlers._tokens.get = (data, callback) => {
    let id = typeof (data.queryStringObject.id) == 'string'
        && data.queryStringObject.id.trim().length == 20
        ? data.queryStringObject.id.trim()
        : null
    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && data) {
                callback(200, tokenData);
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, { Error: "Missing required field" })
    }
}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    let id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 
    ? data.payload.id
    : null,
    extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend
    if (id && extend) {
        _data.read('tokens', id, (err, tokensData) => {
            if (!err && tokensData) {
                if (tokensData.expired > Date.now()) {
                    tokensData.expired = Date.now() + 1000 * 60 * 60

                    //Store new data to disk
                    _data.update('tokens', id, tokensData, err => {
                        if (!err) {
                            callback(200)
                        }else{
                            callback(500, {Error: 'Can not update token'})
                        }
                    })
                }else{
                    callback(400, {Error: 'Token has already expired and can not be extended'})
                }
            }else{
                callback(400, 'The token is not exist')
            }
        });
    }else{
        callback(400, {Error: 'Missing required field(s)'})
    }
}

handlers._tokens.delete = (data, callback) => {

}

module.exports = handlers;


// Verification Func for user data
const verifyData = (data, field, requirement) => {
    let returnedValue
    if (requirement === true) {
        returnedValue = data.payload[field] && data.payload[field]
    } else if (field === 'phone') {
        console.log('field', data.payload[field])
        returnedValue = data.payload[field] && data.payload[field].trim().length == requirement
            ? `${data.payload[field]}` : false
    } else {
        returnedValue = data.payload[field] && data.payload[field].trim().length > requirement
            ? `${data.payload[field]}` : false
    }
    return returnedValue
}