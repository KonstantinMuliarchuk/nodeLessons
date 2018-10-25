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
    console.log('Data which we receive from front: ',firstName, lastName,phone, password , tosAgreement )
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
                }else{
                    callback(500, { Error: 'Can\'t hash the user\'s password'})
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
    
}
//Users put
handlers._users.put = (data, callback) => {

}
//Users delete
handlers._users.delete = (data, callback) => {

}

module.exports = handlers;


// Verification Func for user data
const verifyData = (data, field, requirement) => {
    let returnedValue
    if (requirement === true) {
        returnedValue = data.payload[field] && data.payload[field]
    } else if (field === 'phone') {
        returnedValue = data.payload[field] && data.payload[field].trim().length == requirement
            ? `${data.payload[field]}` : false
    } else {
        returnedValue = data.payload[field] && data.payload[field].trim().length > requirement
            ? `${data.payload[field]}` : false
    }
    return returnedValue
}