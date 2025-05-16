import express from 'express';
import {
    signup,
    login,
    getUserProfile,
    forgotPassword,
    resetPassword,
} from '../controllers/authControllers.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

//Authentication Routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

export default router;
