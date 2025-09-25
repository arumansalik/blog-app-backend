import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if(userExists) return res.status(400).json({ message: "User already exists"});

        const user = await User.create({ username, email, password});
        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne( { email });

        if(user && (await user.matchPassword(password))) {
            res.json({
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({message: "Invalid email or password"});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;