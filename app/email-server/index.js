const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { to, subject, html } = req.body;

  // Gmail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shifa.app.connect@gmail.com", // replace with your Gmail
      pass: "hqycozgurghsbkxn",            // your App Password (paste it as 1 string, no spaces)
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Shifa App" <shifa.app.connect@gmail.com>',
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    res.send({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => res.send("Gmail SMTP API is running"));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
