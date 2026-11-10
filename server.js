const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 100; // Gmail allows ~500/day for normal accounts

app.post("/api/send", async (req, res) => {
  const { email, appPassword, subject, message, recipients } = req.body || {};

  if (!EMAIL_RE.test(email || "")) return res.status(400).json({ error: "Enter a valid sender email." });
  if (!appPassword) return res.status(400).json({ error: "Enter your Gmail app password." });
  if (!subject || !subject.trim()) return res.status(400).json({ error: "Enter a subject." });
  if (!message || !message.trim()) return res.status(400).json({ error: "Write your message." });

  // Split on commas, semicolons, spaces or new lines; remove duplicates
  const list = [...new Set(String(recipients || "").split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean))];
  const valid = list.filter(a => EMAIL_RE.test(a));
  const invalid = list.filter(a => !EMAIL_RE.test(a));

  if (!valid.length) return res.status(400).json({ error: "Add at least one valid recipient." });
  if (valid.length > MAX_RECIPIENTS)
    return res.status(400).json({ error: `Too many recipients. Limit is ${MAX_RECIPIENTS} per send.` });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: email, pass: String(appPassword).replace(/\s+/g, "") },
    pool: true,
    maxConnections: 2
  });

  try {
    await transporter.verify();
  } catch (err) {
    transporter.close();
    return res.status(401).json({
      error: "Gmail rejected the login. Check your email and app password (a normal password will not work)."
    });
  }

  const sent = [];
  const failed = [];

  // Each person gets their own email, so recipients never see each other's addresses
  for (const to of valid) {
    try {
      await transporter.sendMail({ from: email, to, subject: subject.trim(), text: message });
      sent.push(to);
    } catch (err) {
      failed.push({ to, reason: err.message });
    }
  }

  transporter.close();
  res.json({ sent, failed, invalid });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mail sender running at http://localhost:${PORT}`));
