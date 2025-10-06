const { Resend } = require('resend');
const {Env} = require('./env');


const resend = new Resend(Env.RESEND_API_KEY);

const sender ={
    email: Env.EMAIL_FROM,
    name: Env.EMAIL_FROM_NAME
}

module.exports = { resend, sender };


