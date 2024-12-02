const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var bp = require('body-parser');
const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Puedes ajustar el número de rondas de sal a tu preferencia

// Configure SQL connection
const connection = mysql.createConnection({
    host: '127.0.0.1', //172.27.147.244 192.168.0.105 Cambia esto si tu base de datos está en un servidor remoto
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

router.post('/create', function (req, resp) {
    const { Telefono, Correo, Nombre, Password } = req.body;

    if (!Telefono || !Correo || !Nombre || !Password) {
        return resp.status(400).send({
            success: false,
            message: 'Todos los campos (Telefono, Correo, Nombre, Password) son obligatorios',
        });
    }

    // Verificar si el correo o teléfono ya están registrados
    connection.query('SELECT * FROM usuarios WHERE Correo = ? OR Telefono = ?', [Correo, Telefono], function (err, usuarioExistente) {
        if (err) {
            console.log('Error al verificar usuario existente: ' + err);
            return resp.status(500).send({
                success: false,
                message: 'Error al verificar si el usuario ya está registrado',
            });
        }

        if (usuarioExistente.length > 0) {
            return resp.status(409).send({
                success: false,
                message: 'El correo o el teléfono ya están registrados',
            });
        } else {
            // Encriptar la contraseña usando bcrypt
            bcrypt.hash(Password, saltRounds, function (err, hashedPassword) {
                if (err) {
                    console.log('Error al encriptar la contraseña: ' + err);
                    return resp.status(500).send({
                        success: false,
                        message: 'Error al encriptar la contraseña',
                    });
                }

                // Insertar el nuevo usuario con la contraseña encriptada
                connection.query(
                    'INSERT INTO usuarios (Telefono, Correo, Nombre, Password) VALUES (?, ?, ?, ?)',
                    [Telefono, Correo, Nombre, hashedPassword],
                    function (err, result) {
                        if (err) {
                            console.log('Error al crear usuario: ' + err);
                            return resp.status(500).send({
                                success: false,
                                message: 'Error al crear el usuario',
                            });
                        }

                        return resp.status(201).send({
                            success: true,
                            message: 'Usuario creado exitosamente',
                            userId: result.insertId,
                        });
                    }
                );
            });
        }
    });
});


// Endpoint para login
router.post('/login', function (req, resp) {
    const { usuario, password } = req.body; // Obtener usuario y contraseña del cuerpo de la solicitud

    // Verificar si el usuario es un correo o un teléfono
    const query = usuario.includes('@') ? 
        'SELECT * FROM usuarios WHERE Correo = ?' : 
        'SELECT * FROM usuarios WHERE Telefono = ?';

    // Realizar la consulta a la base de datos
    connection.query(query, [usuario], function (err, results) {
        if (err) {
            console.log('Error en la consulta de login: ' + err);
            return resp.status(500).send({ success: false, message: 'Error en la consulta de login' });
        }

        if (results.length === 0) {
            return resp.status(404).send({ success: false, message: 'Usuario no encontrado' });
        }

        const usuarioDB = results[0]; // Suponemos que solo hay un usuario por correo o teléfono

        // Verificar la contraseña
        bcrypt.compare(password, usuarioDB.Password, function (err, isMatch) {
            if (err) {
                console.log('Error al comparar la contraseña: ' + err);
                return resp.status(500).send({ success: false, message: 'Error al verificar la contraseña' });
            }

            if (!isMatch) {
                return resp.status(401).send({ success: false, message: 'Contraseña incorrecta' });
            }

            // Si las credenciales son correctas, devolver el usuario
            resp.status(200).send({
                success: true,
                message: 'Inicio de sesión exitoso',
                usuario: {
                    Id: usuarioDB.Id,
                    Telefono: usuarioDB.Telefono,
                    Correo: usuarioDB.Correo,
                    Nombre: usuarioDB.Nombre,
                },
            });
        });
    });
});



module.exports = router;
