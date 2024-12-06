const express = require('express');
const Company = require('../models/companyModel');
const { authMiddleware } = require('./auth');
const Request = require('../models/requests')
const User = require("../models/userModel")
const router = express.Router();

router.use('/update/:id',authMiddleware(['admin']),async (req,res)=>{
    try {
        const userId = req.params.id;
        const updatedData = req.body;
        console.log(userId)
        // Validate if user exists
        let user = await User.findById(userId);
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user fields
        user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }

});

router.post('/deletion-request', authMiddleware(['user', 'admin']), async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate if user exists
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a Request to admin asking to delete the account
        requestSubject = "Request to Delete My account"
        requestBody = "I Would like  to delete my account permanently"

        request = new Request(
            {requestSubject,requestBody,userId}
        )

        res.status(200).json({ message: 'Deletion request submitted successfully', userId });
    } catch (error) {
        res.status(500).json({ message: 'Error processing deletion request', error: error.message });
    }
});


router.post('/req',authMiddleware(['admin','user']),async (req,res)=>{
    try {
        const { requestSubject, requestBody } = req.body;
        userId = req.user.id;
        const newRequest = new Request({
            requestSubject,
            requestBody,
            userId

        });

        await newRequest.save(); // Save the request to the database
        res.status(201).json({ message: 'Request created successfully', request: newRequest });
    } catch (error) {
        res.status(400).json({ message: 'Error creating request', error: error.message });
    }

});

router.get('/req',authMiddleware(['admin']),async (req,res)=>{
    const results = await Request.find({},{requestCode:1,requestSubject:1,requestBody:1,userId:1,_id:0});
    res.send(results)
})



module.exports=router;