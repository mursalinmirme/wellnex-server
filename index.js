const express = require('express');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('The Wellnex server is running.....');
})





app.listen(port, () => {
    console.log(`The current port ${port} is running now.`)
})







