    const { registerUser, loginUser } = require("../services/auth.service");

    const register = async (req, res) => {
    try {
        const newUser = await registerUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    };
    const login = async (req, res) => {
    try {
        const result = await loginUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    };
    module.exports = {
    register, 
    login
    };

