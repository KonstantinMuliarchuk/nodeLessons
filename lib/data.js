/*
* Library to storing and writing data
*
*/

// Dependencies
var fs = require('fs')
var path = require('path')

// Container for the module to be exported

var lib = {}

//Base directory to the data folder 

lib.baseDir = path.join(__dirname, '../.data/')

//Create path string function
var wholePath = (dir, file) => `${lib.baseDir}${dir}/${file}.json`

//Write data to a file
lib.create = (dir, file, data, callback) => {

    //Open file for a writing
    fs.open(wholePath(dir,file), 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {

            //Convert data to string
            var stringData = JSON.stringify(data)

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false)
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('Error writing new file')
                }
            })
        } else {
            callback(' Could not create new file, it may already exist', err)
        }


    })
}

// Read data from file
lib.read = (dir, file, callback ) => {
    fs.readFile(wholePath(dir, file), 'utf8', (err, data)=> {
        callback(err, data);
    })
}

// Update existing file
lib.update = (dir, file, data, callback) => {
    //Open file for updating
    fs.open(wholePath(dir, file), 'r+', (err, fileDescriptor) => {
        if(!err) {
        
            //Converting data to sting
            var stringData = JSON.stringify(data)

            fs.ftruncate(fileDescriptor, (err) => {
                if(!err) {
                    // Writing to existing file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if(!err) {
                            fs.close(fileDescriptor, (err)=>{
                                if(!err) {
                                    callback(false)
                                }else{
                                    callback('Error closing file')
                                }
                            })
                        }else{
                            callback('Error writing to existing file')
                        }
                    })
                }else{
                    callback('Error truncating data')
                }
            })

        }else{
            callback('Error open the file for updating, it may not exist yet')
        }
    })
}

// Delete file from directory
lib.delete = (dir, file, callback) => {
    fs.unlink(wholePath(dir,file), (err)=>{
        if(!err) {
            callback(false)
        }else{
            callback('Error can not delete file')
        }
    })
}



// Export module
module.exports = lib;