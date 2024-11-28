const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var bp = require('body-parser');
const crypto = require('node:crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure SQL connection
const connection = mysql.createConnection({
    host: '172.27.188.12', //172.27.147.244 192.168.0.105 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});



// Obtener todas las tareas por perfil
router.get('/getByUsuario', function (req, resp) {
    const IdPerfil = req.query.IdPerfil;
    console.log(IdPerfil);
    connection.query(
        'SELECT * FROM tareas WHERE (JSON_CONTAINS(Destinatario, ?) OR Creador = ?)',
        [IdPerfil, IdPerfil],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener las tareas del perfil" });
            } else {
                console.log('/getTareas', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});


// Obtener tarea por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM tareas WHERE Id = ?', [Id], function (err, tarea) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener la tarea por Id' });
        } else {
            if (tarea.length === 0) {
                resp.status(404).send({ success: false, message: 'Tarea no encontrada por Id' });
            } else {
                const args = {
                    Id: tarea[0].Id,
                    Creador: tarea[0].Creador,
                    Destinatario: tarea[0].Destinatario,
                    Nombre: tarea[0].Nombre,
                    Descripcion: tarea[0].Descripcion,
                    Estado: tarea[0].Estado,
                    Categoria: tarea[0].Categoria,
                };
                resp.status(200).send({
                    success: true,
                    message: 'tarea obtenida correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear Tarea
router.post('/create', function (req, res) {
    let { Creador, Destinatario, Nombre, Descripcion, Estado, Categoria } = req.body;



    connection.query('INSERT INTO tareas SET ?', { Creador, Destinatario, Nombre, Descripcion, Estado, Categoria }, function (err) {
        if (err) {
            console.error('Error al crear la tarea: ', err);
            res.status(500).send({ message: err + 'Error al crear la tarea ' });
        } else {
            console.log('Tarea creada correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar tarea
router.put('/update', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Creador, Destinatario, Nombre, Descripcion, Estado, Categoria} = req.body;

    // Actualizar la tarea en la base de datos
    connection.query(
        'UPDATE tareas SET Creador = ?, Destinatario = ?, Nombre = ?, Descripcion = ?, Estado = ?, Categoria = ? WHERE Id = ?',
        [Creador, Destinatario, Nombre, Descripcion, Estado, Categoria, Id],
        function (err) {
            if (err) {
                console.error('Error al editar una tarea: ', err);
                res.status(500).send({ message: err + ' Error al editar la tarea' });
            } else {
                console.log('Tarea editadoa correctamente');
                res.status(200).send({ message: 'Tarea actualizada correctamente' });
            }
        }
    );
});



router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const IdTarea = req.body.IdTarea;

    // Verificar que el IdProducto sea válido
    if (!IdTarea) {
        return res.status(400).send({ success: false, message: 'ID de la tarea no proporcionado' });
    }

    connection.query(
        'DELETE FROM tareas WHERE Id = ?', [IdTarea],
        function (err) {
            if (err) {
                console.error('Error al eliminar una tarea: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar la tarea' });
            } else {
                console.log('Tarea eliminada correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});
module.exports = router;
