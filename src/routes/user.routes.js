import { Router } from 'express';
import { registerUser, loginUser, getuserauth } from '../controllers/userControllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const userRoutes = Router();

userRoutes.post('/register', registerUser);
userRoutes.post('/login', loginUser);
userRoutes.get('/auth', authMiddleware, getuserauth);
