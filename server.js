const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
const db = mongoose.connection
db.on('error', (error)=>console.error(error));
db.once('open', ()=> console.log('Conneted succesfuly to database'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public/picturesProfile', express.static(path.join(__dirname, 'public/picturesProfile')));

const usersRouter = require('./routes/users');
app.use('/users', usersRouter)

const recipesRouter = require('./routes/recipes');
app.use('/recipes', recipesRouter);

const commentsRouter = require('./routes/comments');
app.use('/comments', commentsRouter);

const emailRouter = require('./routes/reset');
app.use('/reset', emailRouter);

app.listen(port, ()=>{
    console.log(`server is runing on ${port}`)
})