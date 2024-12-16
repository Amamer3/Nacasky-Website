require('dotenv').config();
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Verify the transporter configuration
transporter.verify((error) => {
    if (error) {
        console.error('Error setting up email transporter:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'Nacasky Company Limited',
        link: 'https://nacasky.com',
    },
});

// Input validation function
const validateInput = ({ name, phone, email, message }) => {
    if (!name || !phone || !email || !message) {
        return 'All fields are required!';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Invalid email format!';
    }
    if (!/^\+?[0-9\s]+$/.test(phone)) {
        return 'Invalid phone number format!';
    }
    return null;
};

// Exported handler for serverless functions
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, phone, email, message } = req.body;

    // Validate input
    const validationError = validateInput({ name, phone, email, message });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const emailContent = mailGenerator.generate({
        body: {
            name,
            intro: message,
            outro: `Contact details: Phone - ${phone}, Email - ${email}`,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: 'New Contact Form Submission',
        html: emailContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
};
