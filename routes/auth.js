const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Générer un token JWT
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Inscription
router.post('/register', async (req, res) => {
    const { username, email, password,role } = req.body;
    console.log(role)
    try {
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: 'User registration failed' });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({ token,user });
    } catch (err) {
        res.status(400).json({ error: 'Login failed' });
    }
});

router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email ,role:"admin"});
        console.log(user)
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });}
            
        const token = generateToken(user); 
        res.json({ token,user });
    } catch (err) {
        res.status(400).json({ error: 'Login failed' });
    }
});


router.post('/logout',async (req,res)=>{
    res.send('Nothing done try to destroy the JWT')
})

// Middleware de vérification du token
const authMiddleware = (roles = []) => (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        console.log(decoded.role)
        if (roles.length && !roles.includes(decoded.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = router;
module.exports.authMiddleware = authMiddleware;