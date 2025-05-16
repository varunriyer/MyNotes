import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/authModel.js'

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //Check if user exists 
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: `User registered for email - ${email}` });
        }


        //Create a new user 

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid User data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }

}

// @desc    Login user and get token
// @route   POST /api/auth/login
// @access  Public

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Find user by email
        const user = await User.findOne({ email }).select('+password');

        //Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private 

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        }
        else {
            res.status(400).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//@desc     Request password reset 
//@route    POST /api/auth/forgot-password
//@access   Public

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: `User not found for email - ${email}` });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        //Set expire time (10 minutes)

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // In a real app, you would send this reset Token via email but for simplicity we shall send it here itself
        res.json({
            message: 'Password reset token generated',
            resetToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//@desc     Reset Password
//@route    POST /api/auth/reset-password/:resetToken
//@access   Public

export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        //Set new password 
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({
            message: 'Password reset successful',
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', erorr: error.message });
    }
};