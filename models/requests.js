const mongoose = require('mongoose');
const {v4:uuidv4} = require('uuid')
const requestSchema = new mongoose.Schema({
    requestCode:{type:String,required:true,default:uuidv4},
    requestSubject:{type:String,required:true,trim:true},
    requestBody:{type:String,required:true},
    userId:{type:String,required:true},
    createdAt: {
        type: Date,
        default: Date.now
    }

})


module.exports =  mongoose.model('Request', requestSchema);
