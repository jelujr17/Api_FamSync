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



// Obtener todos los wcwntos por usuario
router.get('/getByUsuario', function (req, resp) {
    const IdUsuarioCreador = req.query.IdUsuarioCreador;
    const IdPerfil = req.query.IdPerfil;
    console.log(IdUsuarioCreador + " mas " + IdPerfil);
    connection.query(
        'SELECT * FROM eventos WHERE IdUsuarioCreador = ? AND (JSON_CONTAINS(Participantes, ?) OR IdPerfilCreador = ?)',
        [IdUsuarioCreador, IdPerfil, IdPerfil],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener los eventos" });
            } else {
                console.log('/getEventos', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});

// Obtener evento por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM eventos WHERE Id = ?', [Id], function (err, evento) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener el evento por Id' });
        } else {
            if (evento.length === 0) {
                resp.status(404).send({ success: false, message: 'Evento no encontrado por Id' });
            } else {
                const args = {
                    Id: evento[0].Id,
                    Nombre: evento[0].Nombre,
                    Descripcion: evento[0].Descripcion,
                    FechaInicio: evento[0].FechaInicio,
                    FechaFin: evento[0].FechaFin,
                    IdUsuarioCreador: evento[0].IdUsuarioCreador,
                    IdPerfilCreador: evento[0].IdPerfilCreador,
                    IdCategoria: evento[0].IdCategoria,
                    Participantes: evento[0].Participantes
                };
                resp.status(200).send({
                    success: true,
                    message: 'Evento obtenido correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear evento
router.post('/create', function (req, res) {
    let { Nombre, Descripcion, FechaInicio, FechaFin, IdUsuarioCreador, IdPerfilCreador, IdCategoria, Participantes } = req.body;



    connection.query('INSERT INTO eventos SET ?', { Nombre, Descripcion, FechaInicio, FechaFin, IdUsuarioCreador, IdPerfilCreador, IdCategoria, Participantes }, function (err) {
        if (err) {
            console.error('Error al crear el evento: ', err);
            res.status(500).send({ message: err + 'Error al crear el evento ' });
        } else {
            console.log('Evento creado correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar Evento
router.put('/update', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Nombre, Descripcion, FechaInicio, FechaFin, IdUsuarioCreador, IdPerfilCreador, IdCategoria, Participantes } = req.body;

    // Actualizar el evento en la base de datos
    connection.query(
        'UPDATE productos SET Nombre = ?, Descripcion = ?, FechaInicio = ?, FechaFin = ?, IdUsuarioCreador = ?, IdPerfilCreador = ?, IdCategoria = ?, Participantes = ? WHERE Id = ?',
        [Nombre, Descripcion, FechaInicio, FechaFin, IdUsuarioCreador, IdPerfilCreador, IdCategoria, Participantes, Id],
        function (err) {
            if (err) {
                console.error('Error al editar un evento: ', err);
                res.status(500).send({ message: err + ' Error al editar el evento' });
            } else {
                console.log('Evento editado correctamente');
                res.status(200).send({ message: 'Evento actualizado correctamente' });
            }
        }
    );
});



router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const IdEvento = req.body.IdEvento;

    // Verificar que el IdProducto sea válido
    if (!IdEvento) {
        return res.status(400).send({ success: false, message: 'ID de evento no proporcionado' });
    }

    connection.query(
        'DELETE FROM eventos WHERE Id = ?', [IdEvento],
        function (err) {
            if (err) {
                console.error('Error al eliminar un evento: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar el evento' });
            } else {
                console.log('Evento eliminado correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});
module.exports = router;
