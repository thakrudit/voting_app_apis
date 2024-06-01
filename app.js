const express = require('express');
const app = express();
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', function(req,res){
    res.send('Welcome to our app')
})

// Import routes files
const userRoutes = require('./routes/user');
const condidateRoutes = require('./routes/condidate');

// Use Routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/auth/condidate', condidateRoutes);


const PORT = process.env.APP_PORT || 3333;
app.listen(PORT, ()=>{
    console.clear();
    console.log(`Voting app server is running on port ! ${PORT}`);
})

module.exports = app;