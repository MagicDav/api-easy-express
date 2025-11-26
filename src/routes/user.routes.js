// routes/userRoutes.ts
import { Router } from "express";
import { getUsers, createUser } from "../controllers/userControllers.js";

export const userRoutes = Router();

userRoutes.get("/", getUsers);
userRoutes.post("/crear", createUser);
