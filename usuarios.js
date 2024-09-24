const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var bp = require('body-parser');
const crypto = require('node:crypto');


const app = express();
const port = 3000;

//Configure SQL connection
const db = mysql.createConnection({
    host: '172.27.147.244', // Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',      // Tu usuario de MySQL
    password: 'root',      // La contraseña de tu MySQL
    database: 'smart_family' // El nombre de tu base de datos
});


router.get('/get', function (req, resp) {
    connection.query('select * from usuarios', function (err, rows) {
        if (err) {
            console.log('Error en /get ' + err);
            resp.status(500);
            resp.send({ message: "Error al obtener usuarios" });
        }
        else {
            console.log('/get');
            resp.status(200);
            resp.send(rows);
        }
    })
});




///////////////////////////
