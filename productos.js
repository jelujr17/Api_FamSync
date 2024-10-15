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
    host: '172.27.188.12', //172.27.147.244 Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'famsync' // El nombre de tu base de datos
});



// Obtener todos los productos por usuario
router.get('/getByUsuario', function (req, resp) {
    const IdUsuarioCreador = req.query.IdUsuarioCreador;
    const IdPerfil = req.query.IdPerfil;
    console.log(IdUsuarioCreador + " mas " + IdPerfil);
    connection.query(
        'SELECT * FROM productos WHERE IdUsuarioCreador = ? AND JSON_CONTAINS(Visible, ?)',
    [IdUsuarioCreador, IdPerfil],
        function (err, rows) {
            if (err) {
                console.log('Error en /get ' + err);
                resp.status(500);
                resp.send({ message: "Error al obtener los productos" });
            } else {
                console.log('/getProductos', rows);
                resp.status(200);
                resp.send(rows);
            }
        });
});

// Obtener producto por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM productos WHERE Id = ?', [Id], function (err, producto) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener el perfil por Id' });
        } else {
            if (producto.length === 0) {
                resp.status(404).send({ success: false, message: 'Perfil no encontrado por Id' });
            } else {
                const args = {
                    Id: producto[0].Id,
                    Nombre: producto[0].Nombre,
                    Imagenes: producto[0].Imagenes,
                    Tienda: producto[0].Tienda,
                    IdSustituto: producto[0].IdSustituto,
                    Precio: producto[0].Precio,
                    IdPerfilCreador: producto[0].IdPerfilCreador,
                    IdUsuarioCreador: producto[0].IdUsuarioCreador,
                    Visible: producto[0].Visible,
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
    let { Nombre, Imagenes, Tienda, IdSustituto, Precio, IdPerfilCreador, IdUsuarioCreador, Visible } = req.body;



    connection.query('INSERT INTO productos SET ?', { Nombre, Imagenes, Tienda, IdSustituto, Precio, IdPerfilCreador, IdUsuarioCreador, Visible }, function (err) {
        if (err) {
            console.error('Error al crear el producto: ', err);
            res.status(500).send({ message: err + 'Error al crear el producto ' });
        } else {
            console.log('Producto creado correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar Producto
router.post('/update', async function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Nombre, Imagenes, Tienda, IdSustituto, Precio, Visible } = req.body;


    // Actualizar el perfil en la base de datos
    connection.query(
        'UPDATE productos SET Nombre = ?, Imagenes = ?, Tienda = ?, IdSustituto = ?, Precio = ? Visible = ? WHERE Id = ?',
        [Nombre, Imagenes, Tienda, IdSustituto, Precio, Visible, Id],
        function (err) {
            if (err) {
                console.error('Error al editar un producto: ', err);
                res.status(500).send({ message: err + ' Error al editar el producto' });
            } else {
                console.log('Producto editado correctamente');
                res.status(200).send({ message: 'Bien' });
            }
        }
    );
});


router.delete('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const IdProducto = req.body.IdProducto;

    // Verificar que el IdProducto sea válido
    if (!IdProducto) {
        return res.status(400).send({ success: false, message: 'ID de producto no proporcionado' });
    }

    connection.query(
        'DELETE FROM productos WHERE Id = ?', [IdProducto],
        function (err) {
            if (err) {
                console.error('Error al eliminar un producto: ', err);
                return res.status(500).send({ success: false, message: 'Error al eliminar el producto' });
            } else {
                console.log('Producto eliminado correctamente');
                return res.status(200).send({ success: true });
            }
        }
    );
});



// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\mario\\Documents\\Imagenes_FamSync\\Productos\\');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Utilizar el nombre original del archivo
    }
});
const upload = multer({ storage: storage });

// Ruta para cargar una imagen
router.post('/uploadImagen', upload.single('imagen'), (req, res) => {
    if (!req.file) {
        // Si no se proporciona ninguna imagen, devuelve un error
        res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        return;
    }

    // Devuelve la URL de la imagen cargada
    const imageUrl = path.basename(req.file.path);
    res.status(200).json({ imageUrl: imageUrl });
});

router.post('/receiveFile', (req, res) => {
    const fileName = req.body.fileName; // Obtener el nombre del archivo desde la solicitud

    // Ruta completa del directorio de uploads
    const uploadsDirectory = 'C:\\Users\\mario\\Documents\\Imagenes_FamSync\\Productos\\';

    // Ruta completa del archivo a buscar
    const filePath = path.join(uploadsDirectory, fileName);

    // Verificar si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe, devolver un error
            res.status(404).json({ error: 'El archivo no existe' + filePath });
            return;
        }

        // Si el archivo existe, enviarlo como respuesta
        res.sendFile(filePath);
    });
});


module.exports = router;
