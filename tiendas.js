const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Configure SQL connection
const connection = mysql.createConnection({
    host: '172.27.188.12', //172.27.147.244 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});



// Obtener todos los productos por usuario
router.get('/getByUsuario', function (req, resp) {
    const IdUsuario = req.query.IdUsuario   ;
    connection.query(
        'SELECT * FROM tiendas WHERE IdUsuario = ?',
        [IdUsuario],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener las tiendas" });
            } else {
                console.log('/getTiendasByUsuario', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});

// Obtener producto por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM tiendas WHERE Id = ?', [Id], function (err, tienda) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener la tienda por Id' });
        } else {
            if (producto.length === 0) {
                resp.status(404).send({ success: false, message: 'Tienda no encontrada por Id' });
            } else {
                const args = {
                    Id: producto[0].Id,
                    Nombre: producto[0].Nombre,
                    IdUsuario: producto[0].IdUsuario,
                };
                resp.status(200).send({
                    success: true,
                    message: 'Tienda obtenida correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear producto
router.post('/create', function (req, res) {
    let { Nombre, IdUsuario } = req.body;



    connection.query('INSERT INTO tiendas SET ?', { Nombre, IdUsuario }, function (err) {
        if (err) {
            console.error('Error al crear la tienda: ', err);
            res.status(500).send({ message: err + 'Error al crear la tienda ' });
        } else {
            console.log('Tienda creada correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar Producto
router.put('/update', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Nombre, IdUsuario } = req.body;

    // Actualizar el producto en la base de datos
    connection.query(
        'UPDATE productos SET Nombre = ?, IdUsuario = ? WHERE Id = ?',
        [Nombre, IdUsuario, Id],
        function (err) {
            if (err) {
                console.error('Error al editar una tienda: ', err);
                res.status(500).send({ message: err + ' Error al editar la tienda' });
            } else {
                console.log('Tienda editada correctamente');
                res.status(200).send({ message: 'Tienda actualizada correctamente' });
            }
        }
    );
});



router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const Id = req.body.Id;

    // Verificar que el Id sea válido
    if (!Id) {
        return res.status(400).send({ success: false, message: 'ID de la tienda no proporcionado' });
    }

    connection.query(
        'DELETE FROM productos WHERE Id = ?', [IdProducto],
        function (err) {
            if (err) {
                console.error('Error al eliminar una tienda: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar el producto' });
            } else {
                console.log('Tienda eliminada correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});
module.exports = router;
