// controllers/userController.js
import { prisma } from "../prisma.js";

export const getUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await prisma.user.create({
    data: { name, email, password, role },
  });
  res.json(user);
};
