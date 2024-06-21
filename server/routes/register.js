const router = require("express").Router();
const bcrypt = require("bcrypt")
const pool = require("../db")
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

const valid = require("../middleware/valid")
const token = require("../utils/token")

router.post("/register",valid, async (req,res) => {
    try {
        const {name,email,password} = req.body;
        const user = await pool.query("SELECT * from users where email = $1",[email]);
        if(user.rows.length !== 0){
            return res.status(401).json("user already exists");
        }
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptedPassword = await bcrypt.hash(password,salt)

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING email',
            [name, email, bcryptedPassword]
          );

          console.log("user created");
          const user_id = newUser.rows[0].id;
          const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
          await pool.query('INSERT INTO otp(email,otp,expires_at) VALUES ($1,$2,$3)',[email,otp,expiresAt]);

          const transporter = nodemailer.createTransport({
            host:"smtp@gmail.com",
            service: 'gmail',
            port: 587,
            secure:false,
            auth: {
              user: process.env.GMAIL_USER, 
              pass: process.env.GMAIL_PASS, 
            }
          });

          const mailOptions = {
            from: {
                name:'Dinesh',
                address: process.env.GMAIL_USER
            },
            to: email,
            subject: ' OTP',
            text: `Your OTP is ${otp}.expires in 5 min.`,
          };
          const sendMail = async (transporter,mailOptions) => {
               try {
                
                await transporter.sendMail(mailOptions)
                console.log("email sent")
               } catch (error) {
                console.error(error)
               }
          }
          
          sendMail(transporter,mailOptions)

          const tokenn = token(user_id);
          res.json({tokenn})
        

    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
})

router.post("/a",(req,res)=>{
    res.json("hello");
})


module.exports = router;
