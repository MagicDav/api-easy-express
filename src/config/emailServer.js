import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ex: "smtp.gmail.com"
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para porta 465, false para 587
  auth: {
    user: process.env.SMTP_USER, // seu email
    pass: process.env.SMTP_PASS, // senha ou App Password
  },
});

// testar conexão
transporter.verify(function (error, success) {
  if (error) {
    console.log("Erro no SMTP:", error);
  } else {
    console.log("SMTP pronto para enviar e-mails!");
  }
});
