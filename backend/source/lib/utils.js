const jwt = require('jsonwebtoken');
const { Env } = require('./env');

const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, Env.JWT_SECRET, { // ✅ Changed to "id" to match your token
        expiresIn: '7d'
    });
    
    res.cookie('token', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: Env.NODE_ENV !== 'development'
    });
    
    return token;
};

module.exports = { generateToken };