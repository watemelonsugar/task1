// controllers/authController.js
const bcrypt = require("bcrypt");
const pool = require("../db");
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const token = require("../utils/token");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (user.rowCount !== 0) {
      return res.status(401).json({ err: 'User already exists' });
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING email, id',
      [name, email, bcryptedPassword]
    );

    console.log("User created");
    const user_id = newUser.rows[0].id;
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query('INSERT INTO otp (email, otp, expires_at) VALUES ($1, $2, $3)', [email, otp, expiresAt]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: {
        name: 'Dinesh',
        address: process.env.GMAIL_USER,
      },
      to: email,
      subject: 'OTP',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent");

    const tokenn = token(user_id);
    res.status(200).json({ message: 'Registration successful.', tokenn });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rowCount === 0) {
      return res.status(404).json({ err: 'User not found.' });
    }

    const isVerified = user.rows[0].is_verified;
    if (!isVerified) {
      return res.status(403).json({ err: 'User not verified.' });
    }

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) {
      return res.status(401).json({ err: 'Invalid password.' });
    }

    const tokenn = token(user.rows[0].id);
    res.status(200).json({ message: 'Login successful.', tokenn });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = await pool.query('SELECT otp FROM otp WHERE email = $1', [email]);
    if (storedOtp.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    const perfectotp = storedOtp.rows[0].otp;
    if (otp !== perfectotp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
    res.status(200).json({ message: 'OTP verified successfully.' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
