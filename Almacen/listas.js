const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var bp = require('body-parser');;

// Configure SQL connection
const connection = mysql.createConnection({
    host: '172.27.188.12', //172.27.147.244 192.168.0.105 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});



// Obtener todos los productos por usuario
router.get('/getByUsuario', function (req, resp) {
    const IdUsuario = req.query.IdUsuario;
    const IdPerfil = req.query.IdPerfil;
    connection.query(
        'SELECT * FROM listas WHERE IdUsuario = ? AND JSON_CONTAINS(Visible, ?)',
        [IdUsuario, IdPerfil],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener las listas" });
            } else {
                console.log('/getListas', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});

// Obtener producto por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM listas WHERE Id = ?', [Id], function (err, lista) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener la lista por Id' });
        } else {
            if (producto.length === 0) {
                resp.status(404).send({ success: false, message: 'Lista no encontrado por Id' });
            } else {
                const args = {
                    Id: producto[0].Id,
                    Nombre: producto[0].Nombre,
                    IdUsuario: producto[0].IdUsuario,
                    IdPerfil: producto[0].IdPerfil,
                    Visible: producto[0].Visible,
                    Productos: productos[0].Productos
                };
                resp.status(200).send({
                    success: true,
                    message: 'Producto obtenido correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear producto
router.post('/create', function (req, res) {
    let { Nombre, IdUsuario, IdPerfil, Visible , Productos} = req.body;



    connection.query('INSERT INTO listas SET ?', { Nombre, IdUsuario, IdPerfil, Visible, Productos }, function (err) {
        if (err) {
            console.error('Error al crear la lista: ', err);
            res.status(500).send({ message: err + 'Error al crear la lista ' });
        } else {
            console.log('Lista creada correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar Producto
router.put('/update', async function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Nombre, Visible, Productos } = req.body;


    // Actualizar el perfil en la base de datos
    connection.query(
        'UPDATE listas SET Nombre = ?, Visible = ?, Productos = ? WHERE Id = ?',
        [Nombre, Visible, Productos, Id],
        function (err) {
            if (err) {
                console.error('Error al editar la lista: ', err);
                res.status(500).send({ message: err + ' Error al editar la lista' });
            } else {
                console.log('Lista editada correctamente');
                res.status(200).send({ message: 'Bien' });
            }
        }
    );
});


router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const IdLista = req.body.IdLista;

    // Verificar que el IdProducto sea válido
    if (!IdLista) {
        return res.status(400).send({ success: false, message: 'ID de lista no proporcinado' });
    }

    connection.query(
        'DELETE FROM listas WHERE Id = ?', [IdLista],
        function (err) {
            if (err) {
                console.error('Error al eliminar la lista: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar la lista' });
            } else {
                console.log('Lista eliminada correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});
module.exports = router;
