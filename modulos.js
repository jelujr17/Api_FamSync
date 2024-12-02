const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Configure SQL connection
const connection = mysql.createConnection({
    host: '127.0.0.1', //172.27.147.244 192.168.0.105 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});

// Obtener todos los usuarios
router.get('/get', function (req, resp) {
    connection.query('SELECT * FROM modulos', function (err, rows) {
        if (err) {
            console.log('Error en /get ' + err);
            resp.status(500);
            resp.send({ message: "Error al obtener los modulos" });
        } else {
            console.log('/get');
            resp.status(200);
            resp.send(rows);
        }
    });
});


// Obtener categoria por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM modulos WHERE Id = ?', [Id], function (err, modulos) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener el modulos por Id' });
        } else {
            if (modulos.length === 0) {
                resp.status(404).send({ success: false, message: 'Modulo no encontrado por Id' });
            } else {
                const args = {
                    Id: modulos[0].Id,
                    Nombre: modulos[0].Nombre,
                    Descripcion: modulos[0].Descripcion
                };
                resp.status(200).send({
                    success: true,
                    message: 'Modulo obtenido correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear producto
router.post('/create', function (req, res) {
    let { Nombre, Descripcion } = req.body;



    connection.query('INSERT INTO modulos SET ?', { Nombre, Descripcion }, function (err) {
        if (err) {
            console.error('Error al crear el modulo: ', err);
            res.status(500).send({ message: err + 'Error al crear el modulo ' });
        } else {
            console.log('Modulo creado correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar categoria
router.put('/update', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Nombre, Descripcion } = req.body;

    // Actualizar la categoria en la base de datos
    connection.query(
        'UPDATE modulos SET Nombre = ?, Descripcion = ? WHERE Id = ?',
        [Nombre, Descripcion, Id],
        function (err) {
            if (err) {
                console.error('Error al editar un modulo: ', err);
                res.status(500).send({ message: err + ' Error al editar un modulo' });
            } else {
                console.log('Modulo editado correctamente');
                res.status(200).send({ message: 'Modulo actualizado correctamente' });
            }
        }
    );
});



router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const Id = req.body.Id;

    // Verificar que el Id sea válido
    if (!Id) {
        return res.status(400).send({ success: false, message: 'ID del modulo no proporcionado' });
    }

    connection.query(
        'DELETE FROM modulos WHERE Id = ?', [Id],
        function (err) {
            if (err) {
                console.error('Error al eliminar un modulo: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar el modulo' });
            } else {
                console.log('Modulo eliminada correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});
module.exports = router;
