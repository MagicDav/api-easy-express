import { prisma } from '../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";
import { transporter } from '../config/emailServer.js'; // seu transportador SMTP
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Função auxiliar para criar token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
// -----------------------
// Listar usuários
// -----------------------
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
        select: {   
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// -----------------------
// listar usuário por ID
// -----------------------
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

 // -----------------------
// REGISTER com verificação de e-mail
// -----------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!email && !phone)
      return res.status(400).json({ error: "Email ou Telefone é obrigatório" });

    // Verificar email
    if (email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ error: "Email já cadastrado" });
    }

    // Verificar telefone
    if (phone) {
      const exists = await prisma.user.findUnique({ where: { phone } });
      if (exists) return res.status(400).json({ error: "Telefone já cadastrado" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Criar usuário com campo isVerified false
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role }
    });

    // Gerar token de verificação único
    const verifyToken = crypto.randomBytes(32).toString('hex');

    // Salvar token na tabela de verificação (ou no próprio usuário)
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verifyToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
    });

    // Enviar e-mail de verificação
    if (email) {
      await transporter.sendMail({
        from: '"Easy Express" Plataforma de Vendas <',
        to: user.email,
        subject: "Verifique seu e-mail",
        html: `<p>Olá ${user.name},</p>
               <p>Clique no link abaixo para verificar seu e-mail:</p>
               <a href="https://seu-frontend.com/verify-email?token=${verifyToken}">Verificar e-mail</a>
               <p>O link expira em 24 horas.</p>`
      });
    }

    res.json({ message: "Usuário cadastrado com sucesso! Verifique seu e-mail.", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------
// LOGIN EMAIL + SENHA
// -----------------------
export const loginEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Senha incorreta" });

    res.json({ message: "Login realizado com sucesso", token: generateToken(user), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------
// LOGIN TELEFONE (Entrega)
// -----------------------
export const loginPhone = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Telefone e senha são obrigatórios" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: "Telefone não cadastrado" });
    }

    // Apenas entregadores podem usar telefone
    if (user.role !== "DELIVER") {
      return res.status(403).json({ error: "Somente entregadores podem logar com telefone" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Senha incorreta" });
    }


    res.json({
      message: "Login realizado com sucesso",
      token: generateToken(user),
      user,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// -----------------------
// LOGIN COM GOOGLE
// -----------------------

export const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken)
      return res.status(400).json({ error: "idToken é obrigatório" });

    // 1. Validar token com Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // 2. Verificar se usuário já existe
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    // 3. Criar se não existir
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          avatar: picture,
          role: "CLIENT",
        },
      });
    }

    // 4. Gerar JWT
    const token = generateToken(user);

    res.json({ token, user });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Falha ao autenticar com Google",
      details: err.message
    });
  }
};
// -----------------------
// GET ME
// -----------------------
export const getuserauth = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
          
            
