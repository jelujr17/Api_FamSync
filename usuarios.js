const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var bp = require('body-parser');
const crypto = require('node:crypto');

// Configure SQL connection
const connection = mysql.createConnection({
    host: '172.27.147.244', //172.27.147.244 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});

// Obtener todos los usuarios
router.get('/get', function (req, resp) {
    connection.query('SELECT * FROM usuarios', function (err, rows) {
        if (err) {
            console.log('Error en /get ' + err);
            resp.status(500);
            resp.send({ message: "Error al obtener usuarios" });
        } else {
            console.log('/get');
            resp.status(200);
            resp.send(rows);
        }
    });
});
// Obtener usuario por correo
router.get('/getByCorreo', function (req, resp) {
    const correo = req.query.correo; // Cambiar a req.query.correo
    connection.query('SELECT * FROM usuarios WHERE Correo = ?', [correo], function (err, usuario) {
        if (err) {
            console.log('Error en /getByCorreo ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener usuario por correo' });
        } else {
            if (usuario.length === 0) {
                resp.status(404).send({ success: false, message: 'Usuario no encontrado por correo' });
            } else {
                const args = {
                    Id: usuario[0].Id,
                    Telefono: usuario[0].Telefono,
                    Correo: usuario[0].Correo,
                    Nombre: usuario[0].Nombre,
                    Password: usuario[0].Password,
                };
                resp.status(200).send({
                    success: true,
                    message: 'Usuario obtenido correctamente mediante correo',
                    arguments: args,
                });
            }
        }
    });
});


// Obtener usuario por teléfono
router.get('/getByTelefono', function (req, resp) {
    const telefono = req.query.telefono; // Cambiar a req.query.telefono
    connection.query('SELECT * FROM usuarios WHERE Telefono = ?', [telefono], function (err, usuario) {
        if (err) {
            console.log('Error en /getByTelefono ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener usuario por teléfono' });
        } else {
            if (usuario.length === 0) {
                resp.status(404).send({ success: false, message: 'Usuario no encontrado por teléfono' });
            } else {
                const args = {
                    Id: usuario[0].Id,
                    Telefono: usuario[0].Telefono,
                    Correo: usuario[0].Correo,
                    Nombre: usuario[0].Nombre,
                    Password: usuario[0].Password,
                };
                resp.status(200).send({
                    success: true,
                    message: 'Usuario obtenido correctamente mediante teléfono',
                    arguments: args,
                });
            }
        }
    });
});

// Obtener usuario por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.id; // Cambiar a req.query.id
    connection.query('SELECT * FROM usuarios WHERE Id = ?', [Id], function (err, usuario) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener usuario por Id' });
        } else {
            if (usuario.length === 0) {
                resp.status(404).send({ success: false, message: 'Usuario no encontrado por Id' });
            } else {
                const args = {
                    Id: usuario[0].Id,
                    Telefono: usuario[0].Telefono,
                    Correo: usuario[0].Correo,
                    Nombre: usuario[0].Nombre,
                    Password: usuario[0].Password,
                };
                resp.status(200).send({
                    success: true,
                    message: 'Usuario obtenido correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

module.exports = router;
