const express = require('express');
const Company = require('../models/companyModel');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Créer une entreprise (Utilisateur authentifié)
router.post('/', authMiddleware(['user', 'admin']), async (req, res) => {
    try {
        const { name, registrationNumber } = req.body;
        const company = new Company({
            name,
            registrationNumber,
            owner: req.user.id
        });
        await company.save();
        res.status(201).json(company);
    } catch (err) {
        res.status(400).json({ error: 'Company creation failed' });
    }
});

// Validation d'une entreprise (Admin seulement)
router.patch('/:id/validate', authMiddleware(['admin']), async (req, res) => {
    try {
        console.log(req.params.id)
        const company = await Company.findOneAndUpdate({registrationNumber:req.params.id},{status:'validated'},{new:true});
        console.log(company)
        if (!company) return res.status(404).json({ error: 'Company not found' });

        /* company.status = 'validated';
        await company.save(); */
        res.json(company);
    } catch (err) {
        res.status(400).json({ error: 'Validation failed' });
    }
});

router.get('/admin',authMiddleware(['admin']),async (req,res)=>{
    companies = await Company.find({},{name:1,status:1,registrationNumber:1,owner:1,_id:0})
    res.send(companies)
})





router.get("/list",authMiddleware(['user']), async (req, res) =>{
    userId = req.user.id;
    const companies = await  Company.find({owner:userId},{name:1,status:1,registrationNumber:1,_id:0})
    console.log(companies,userId)
    res.send(companies)
})

router.get('/:id/delete',authMiddleware(['user']),async (req,res)=>{
    userId = req.user.id;
    companyId =req.params.id;
    try {
        const company =  await Company.deleteOne({registrationNumber:companyId,owner:userId})
        res.status(201).json({success: 'Company deleted successfuly'})

    }catch(err){
        res.status(400).json({ error: 'Company deletion failed' });
    }
    
})

module.exports = router;