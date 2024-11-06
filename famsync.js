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
const perfilesRouter = require('./perfiles');
const productosRouter = require('./Almacen/productos');
const listasRouter = require('./Almacen/listas');
const tiendasRouter = require('./Almacen/tiendas');
const eventosRouter = require('./Calendario/eventos');
const categoriasRouter = require('./categorias');
const modulosRouter = require('./modulos');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: '172.27.188.12', //172.27.147.244 192.168.0.105 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',      // Tu usuario de MySQL
    password: 'root',      // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// Use routers
app.use('/usuarios', usuariosRouter);
app.use('/perfiles', perfilesRouter);
app.use('/productos', productosRouter);
app.use('/listas', listasRouter);
app.use('/tiendas', tiendasRouter);
app.use('/eventos', eventosRouter);
app.use('/categorias', categoriasRouter);
app.use('/modulos', modulosRouter);

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
