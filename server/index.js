import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password for Gmail
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

// POST route to handle form submissions
app.post('/api/contact', async (req, res) => {
    const { name, phone, email, message } = req.body;

    // Validate input
    const validationError = validateInput({ name, phone, email, message });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    // Generate email content
    const emailContent = mailGenerator.generate({
        body: {
            name: "Hello Nacasky Team,",
            intro: [
                "You have received a new inquiry through your website contact form.",
                "Below are the details of the submission:"
            ],
            logo: "https://imgbox.com/c9D1PY8d", // Add your company logo URL
            dictionary: {
                "Name": name,
                "Phone": phone,
                "Email": email,
                "Message": message
            },
            outro: [
                "Please follow up with this inquiry promptly.",
                "Warm regards,",
                "Your Automated Notification System"
            ]
        }
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
});

// Test route
app.get("/", (req, res) => res.send("Express on Vercel"));

// Start the server
const PORT = process.env.PORT || 5501; // Use environment variable or default to 5501
app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

// Export the app for Vercel
export default app;
