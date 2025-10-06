const jwt = require('jsonwebtoken');
const {ENV} = require('./env');

const generateToken = (user, res) => {
        const { JWT_SECRET } = ENV;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
    });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production' ? true : false,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return token;
};

module.exports = { generateToken };