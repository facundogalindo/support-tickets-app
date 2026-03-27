    const jwt = require("jsonwebtoken");
    require("dotenv").config();



    const bcrypt = require("bcrypt");
    const {
    createUser,
    findUserByEmail,
    } = require("../repositories/user.repository");

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


    module.exports = {
    registerUser,
    loginUser,
    };
