const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors')
require('dotenv').config()

connectToMongo();
const app = express()
const port = process.env.PORT
app.use(express.json());
app.use(cors());



// AVAILABLE ROUTES 
app.use('/api/auth',require('./routes/auth'))
app.use('/api/gpa',require('./routes/auth'))
app.use('/api/semester',require('./routes/semester'))
app.use('/api/subject',require('./routes/subject'))



app.listen(port, () => {
    console.log(`Scholix backend listening on port ${port}`)
})