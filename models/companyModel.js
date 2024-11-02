const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true,unique: true  },
    registrationNumber: { type: String, required: true,unique: true },
    status: { type: String, enum: ['pending', 'validated', 'rejected'], default: 'pending' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Company', companySchema);