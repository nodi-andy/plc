const express = require('express')

const app = express()
app.use(express.static('data'));
app.listen(8080)