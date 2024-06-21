const express = require("express");
const app = express();
const cors = require("cors")

require('dotenv').config()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT ;

app.use("/action",require("./routes/register"))
app.use("/action",require("./routes/login"))
app.use("/action",require("./routes/verifyotp"))
app.listen(PORT,async (req,res) => {
    console.log(`Server started running on port ${PORT}`)
})