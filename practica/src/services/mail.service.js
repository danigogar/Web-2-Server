import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (to, code) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Verifica tu cuenta - BildyApp',
      html: `
        <h1>Bienvenido a BildyApp</h1>
        <p>Tu código de verificación es: <strong>${code}</strong></p>
        <p>Este código expira después de 3 intentos.</p>
      `
    });
    console.log('Email de verificación enviado a', to);
  } catch (error) {
    console.error('Error enviando email:', error.message);
  }
};
