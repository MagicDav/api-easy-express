import { Router } from "express";
import {
  registerUser,
  loginEmail,
  loginPhone,
  loginGoogle,
  getuserauth,
  getUsers,
  getUserById
} from "../controllers/userControllers.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

export const userRoutes = Router();

userRoutes.get("/", getUsers);
userRoutes.get("/:id", getUserById);
userRoutes.post("/register", registerUser);
userRoutes.post("/login/email", loginEmail);
userRoutes.post("/login/phone", loginPhone);
userRoutes.post("/login/google", loginGoogle);

userRoutes.get("/auth", authMiddleware, getuserauth);
