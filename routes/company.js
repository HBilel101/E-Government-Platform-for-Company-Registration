const express = require('express');
const Company = require('../models/companyModel');
const { authMiddleware } = require('./auth');
const { Sender } = require('mailersend');
const router = express.Router();
//necessary for the Email Notif API
const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend").MailerSend;

//console.log(new MailerSend())

const mailerSend = new MailerSend({apiKey:`${process.env.API_KEY}`});

router.post("/email",async (req,res)=>{
    const recipients = [new Recipient("hbilel992@gmail.com","Bilel")]
    console.log(EmailParams) 
    const sentFrom = new Sender('MS_W9YUEb@trial-pq3enl6oj5ml2vwr.mlsender.net')
    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Subject")
    .setHtml("Greetings from the team, you got this message through MailerSend.")
    .setText("Greetings from the team, you got this message through MailerSend.");   
    try {
        console.log("here")
    const response = await mailerSend.email.send(emailParams);
    res.status(201).json({statut:'succ'});
    }
    catch (error){
        console.log(error);
        res.status(400).json({ error: error });
    }
})
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