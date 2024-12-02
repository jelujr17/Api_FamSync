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



// Obtener todos los productos por usuario
router.get('/getByPerfil', function (req, resp) {
    const IdUsuario = req.query.IdUsuario;
    connection.query(
        'SELECT * FROM categorias WHERE IdUsuario = ?',
        [IdUsuario],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener las categorias" });
            } else {
                console.log('/getCategoriasByPerfil', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});

// Obtener todos los productos por usuario
router.get('/getByModulo', function (req, resp) {
    const IdUsuario = req.query.IdUsuario;
    const IdModulo = req.query.IdModulo;
    connection.query(
        'SELECT * FROM categorias WHERE IdUsuario = ? AND  IdModulo = ?',

        [IdUsuario, IdModulo],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener las categorias por modulo" });
            } else {
                console.log('/getCategoriasByModulo', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});

// Obtener categoria por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM categorias WHERE Id = ?', [Id], function (err, categoria) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener la categoria por Id' });
        } else {
            if (categoria.length === 0) {
                resp.status(404).send({ success: false, message: 'Categoria no encontrada por Id' });
            } else {
                const args = {
                    Id: categoria[0].Id,
                    IdModulo: categoria[0].IdModulo,
                    Color: categoria[0].Color,
                    Nombre: categoria[0].Nombre,
                    IdUsuario: categoria[0].IdUsuario
                };
                resp.status(200).send({
                    success: true,
                    message: 'Categoria obtenida correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear producto
router.post('/create', function (req, res) {
    let { IdModulo, Color, Nombre, IdUsuario } = req.body;



    connection.query('INSERT INTO categorias SET ?', { IdModulo, Color, Nombre, IdUsuario }, function (err) {
        if (err) {
            console.error('Error al crear la categoria: ', err);
            res.status(500).send({ message: err + 'Error al crear la categoria ' });
        } else {
            console.log('Categoria creada correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar categoria
router.put('/update', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, IdModulo, Color, Nombre, IdUsuario } = req.body;

    // Actualizar la categoria en la base de datos
    connection.query(
        'UPDATE categorias SET IdModulo = ?, Color = ?, Nombre = ?, IdUsuario = ? WHERE Id = ?',
        [IdModulo, Color, Nombre, IdUsuario, Id],
        function (err) {
            if (err) {
                console.error('Error al editar una categoria: ', err);
                res.status(500).send({ message: err + ' Error al editar la categoria' });
            } else {
                console.log('Categoria editada correctamente');
                res.status(200).send({ message: 'Categoria actualizada correctamente' });
            }
        }
    );
});



router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const Id = req.body.Id;

    // Verificar que el Id sea válido
    if (!Id) {
        return res.status(400).send({ success: false, message: 'ID de la categoria no proporcionado' });
    }

    connection.query(
        'DELETE FROM categorias WHERE Id = ?', [Id],
        function (err) {
            if (err) {
                console.error('Error al eliminar una categoria: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar la categoria' });
            } else {
                console.log('Categoria eliminada correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});
module.exports = router;
