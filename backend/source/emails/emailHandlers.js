const { Resend } = require('resend');
const { createWelcomeEmailTemplate } = require('./emailTemplate');
require('dotenv').config();
const { ENV } = require('../lib/env');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (email, name, clientURL) => {
    try {
        console.log(`Sending welcome email to ${email} for user ${name}`);
        
        const { data, error } = await resend.emails.send({
            from: `${ENV.EMAIL_FROM_NAME} <${ENV.EMAIL_FROM}>`,
            to: email,
            subject: 'Welcome to Chatify!',
            html: createWelcomeEmailTemplate(name, clientURL)
        });
        
        if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
        
        console.log("Welcome email sent successfully:", data);
        return data;
        
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
};

module.exports = { 
    sendWelcomeEmail 
};