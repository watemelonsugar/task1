const router = require("express").Router();

const pool = require("../db")

const token = require("../utils/token")
const bcrypt = require("bcrypt")

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
  
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rowCount === 0) {
      return res.status(404).json({ err: 'User not found.' });
    }
  
    const isVerified = user.rows[0].is_verified;
    if (!isVerified) {
      return res.status(403).json({err:    '    User not verified.' });
    }
  
    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) {
      return res.status(401).json({ err: 'Invalid password.' });
    }

    const tokenn = token(user.rows[0].id);
  

    res.status(200).json({ message: 'Login successful.' ,tokenn});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
    
  });

  module.exports = router