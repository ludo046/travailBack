//imports
const express = require('express');
const apiRouter = require('./apiRouter').router;
const path = require('path');
const helmet = require('helmet')
const fs = require('fs');
require('dotenv').config();
const db = require("./models");
const { emit } = require('process');
//db.sequelize.sync();
//db.sequelize.sync({force: true});
require('dotenv').config();
const users = {};


//instantiate server
let server = express();

//parser config
server.use(express.urlencoded({ extended:true }));
server.use(express.json());
server.use(helmet());

//configure routes
server.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

let http = require('https').Server(server);
//let httpServer = http.Server(server);

let io = require('socket.io')(http);
//let io = socketIO(httpServer);

server.use('/api/', apiRouter);
server.use('/images', express.static(path.join(__dirname, 'images')));

//launch server
http.listen(8080, function(){
    console.log('Server en écoute :)');
})

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('login', (user) => {
        console.log('a user ' + user.userId + ' connected');
        io.emit('login', users[socket.id] = user.userId);
    })
    socket.on('my message', (msg) => {
        io.emit('my broadcast', ({msg}))
    })
    socket.on('room message', (msg) => {
        io.emit('message room', ({msg}))
    })
    socket.on('offline', (usere) => {
        console.log('user '+ usere.userId +' disconnected');
        io.emit('offline', usere.userId);
        delete users[socket.id]
        
    })

})

