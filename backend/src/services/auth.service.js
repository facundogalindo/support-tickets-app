const jwt = require("jsonwebtoken");
require("dotenv").config();

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const {
  createUser,
  findUserByEmail,
  saveResetTokenByEmail,
  findUserByResetToken,
  updatePasswordAndClearResetToken,
} = require("../repositories/user.repository");

const { sendMail } = require("./mail.service");

const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    throw new Error("Todos los campos son obligatorios");
  }

  const validRoles = ["user", "agent"];

  if (!validRoles.includes(role)) {
    throw new Error("Rol inválido");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("El email ya está registrado");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    name,
    email,
    passwordHash,
    role,
  });

  return newUser;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email y password son obligatorios");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const forgotPassword = async ({ email }) => {
  if (!email || !email.trim()) {
    throw new Error("El email es obligatorio");
  }

  const user = await findUserByEmail(email.trim());

  if (!user) {
    return {
      message:
        "Si el email existe en el sistema, se enviaron instrucciones para recuperar la contraseña.",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await saveResetTokenByEmail(user.email, resetToken, expiresAt);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Recuperación de contraseña",
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Hacé clic en el siguiente enlace:</p>
      <p>
        <a href="${resetLink}" target="_blank" rel="noopener noreferrer">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace vence en 1 hora.</p>
      <p>Si no solicitaste este cambio, podés ignorar este mensaje.</p>
    `,
  });

  return {
    message:
      "Si el email existe en el sistema, se enviaron instrucciones para recuperar la contraseña.",
  };
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new Error("Token y nueva contraseña son obligatorios");
  }

  if (newPassword.length < 6) {
    throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
  }

  const user = await findUserByResetToken(token);

  if (!user) {
    throw new Error("Token inválido");
  }

  if (!user.reset_token_expires_at) {
    throw new Error("Token inválido");
  }

  const expiresAt = new Date(user.reset_token_expires_at);

  if (expiresAt < new Date()) {
    throw new Error("El token expiró");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await updatePasswordAndClearResetToken(user.id, passwordHash);

  return {
    message: "La contraseña se actualizó correctamente",
  };
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};