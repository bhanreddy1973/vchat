function createWelcomeEmailTemplate(name, clientURL) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Vchat</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to Vchat!</h1>
        </div>
        <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
            <p>We're excited to have you join our messaging platform! Vchat connects you with friends, family, and colleagues in real-time.</p>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC;">
                <p style="font-size: 16px; margin: 0 0 15px 0; color: #333;"><strong>Get started:</strong></p>
                <ul style="padding-left: 20px; margin: 0; color: #555;">
                    <li style="margin-bottom: 10px;">Set up your profile</li>
                    <li style="margin-bottom: 10px;">Find and add contacts</li>
                    <li style="margin-bottom: 10px;">Start conversations</li>
                    <li style="margin-bottom: 0;">Share messages and media</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${clientURL}" 
                   style="background: linear-gradient(to right, #36D1DC, #5B86E5);
                          color: #ffffff !important;
                          text-decoration: none;
                          padding: 15px 40px;
                          border-radius: 50px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 17px;
                          letter-spacing: 0.5px;
                          border: none;
                          box-shadow: 0 6px 18px rgba(91, 134, 229, 0.35);
                          transition: all 0.3s ease-in-out;">
                    Open Vchat
                </a>
            </div>
            
            <p>Happy chatting!</p>
            <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Vchat Team</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Vchat. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
}

// Only export template function
module.exports = { 
    createWelcomeEmailTemplate
};