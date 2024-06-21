const router = require("express").Router();
const pool = require("../db")


router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
  
        const storedOtp = await pool.query('SELECT otp FROM otp WHERE email = $1 ', [email]);
        const perfectotp = storedOtp.rows[0].otp;
        console.log(perfectotp)
    
        if (otp !== perfectotp) {
        return res.status(400).json({ error: 'Invalid OTP.' });
        }
    

        await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
  
        res.status(200).json({ message: 'OTP verified successfully.' });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
    
  });

  module.exports = router;