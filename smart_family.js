const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
var mysql = require('mysql');
var bp = require('body-parser');
const crypto = require('node:crypto');

const app = express();
const port = 3000;
app.use(express.json());

const usuariosRouter = require('./usuarios');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: '172.27.147.244', // Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',      // Tu usuario de MySQL
    password: 'root',      // La contraseña de tu MySQL
    database: 'smart_family' // El nombre de tu base de datos
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Use routers
app.use('/usuarios', usuariosRouter);


db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});


// Escuchar en el puerto
const server = http.createServer(app);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
