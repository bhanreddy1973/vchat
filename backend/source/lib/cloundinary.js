const cloudinary = require('cloudinary').v2;
const {Env} = require('./env');

cloudinary.config({
    cloud_name: Env.CLOUDINARY_CLOUD_NAME,
    api_key: Env.CLOUDINARY_API_KEY,
    api_secret: Env.CLOUDINARY_API_SECRET
});

module.exports = { cloudinary };