const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;
app.use("/action", require("./routes/auth"));

app.listen(PORT, () => {
    console.log(`Server started running on port ${PORT}`);
});
