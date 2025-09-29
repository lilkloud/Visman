const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
}));
// Basic security headers
app.use(helmet());
// Rate limit all API routes
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

// Ensure data directory
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, '[]');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'visman-contact', time: new Date().toISOString() });
});

// Prepare mail transport (optional)
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false otherwise
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (e) {
    console.warn('Email transport not initialized:', e.message);
  }
}

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, project, subject, message, company_website } = req.body || {};

    // Honeypot: if filled, likely bot -> accept but ignore
    if (company_website && String(company_website).trim() !== '') {
      return res.json({ ok: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: name, email, message' });
    }

    const lead = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      project: project || '',
      subject: subject || '',
      message,
      createdAt: new Date().toISOString(),
      ip: req.ip,
      ua: req.headers['user-agent'] || '',
    };

    const buf = fs.readFileSync(leadsFile, 'utf-8');
    const list = JSON.parse(buf);
    list.push(lead);
    fs.writeFileSync(leadsFile, JSON.stringify(list, null, 2));

    // Fire-and-forget email notification if configured
    if (mailer) {
      const to = process.env.NOTIFY_TO || process.env.SMTP_USER;
      const from = process.env.MAIL_FROM || `Visman <no-reply@visman.local>`;
      const mailOptions = {
        from,
        to,
        subject: subject && subject.trim() ? `[Visman] ${subject}` : '[Visman] New Contact Form Submission',
        text: `New contact submission\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nProject: ${project || ''}\nSubject: ${subject || ''}\nMessage: ${message}\n\nAt: ${lead.createdAt} (ID: ${lead.id})`,
      };
      // Do not block response on email
      mailer.sendMail(mailOptions).catch(err => {
        console.warn('Failed to send notification email:', err.message);
      });
    }

    return res.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error('Failed to store lead', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Visman contact server listening on http://localhost:${PORT}`);
});
