import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",     // servidor SMTP do Gmail
  port: 587,                  // porta TLS
  secure: false,              // true para 465, false para 587
  auth: {
    user: process.env.SMTP_USER, // seu e-mail
    pass: process.env.SMTP_PASS, // senha ou app password do Gmail
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
