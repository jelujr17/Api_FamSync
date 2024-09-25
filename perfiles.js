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
    host: '172.27.147.244', // Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',           // Tu usuario de MySQL
    password: 'root',       // La contraseña de tu MySQL
    database: 'smart_family' // El nombre de tu base de datos
});

// Obtener todos los perfiles
router.get('/get', function (req, resp) {
    connection.query('SELECT * FROM perfiles', function (err, rows) {
        if (err) {
            console.log('Error en /get ' + err);
            resp.status(500);
            resp.send({ message: "Error al obtener los perfiles" });
        } else {
            console.log('/get');
            resp.status(200);
            resp.send(rows);
        }
    });
});

// Obtener todos los perfiles por usuario
router.get('/getByUsuario', function (req, resp) {
    const UsuarioId = req.query.UsuarioId; // Cambiar a req.query.id

    connection.query('SELECT * FROM perfiles  WHERE UsuarioId = ?', [UsuarioId], function (err, rows) {

        if (err) {
            console.log('Error en /get ' + err);
            resp.status(500);
            resp.send({ message: "Error al obtener los perfiles" });
        } else {
            console.log('/getByUsuario');
            resp.status(200);
            resp.send(rows);
        }
    });
});

// Obtener perfil por Id
router.get('/getById', function (req, resp) {
    const Id = req.query.Id; // Cambiar a req.query.id
    connection.query('SELECT * FROM perfiles WHERE Id = ?', [Id], function (err, usuario) {
        if (err) {
            console.log('Error en /getById ' + err);
            resp.status(500).send({ success: false, message: 'Error al obtener el perfil por Id' });
        } else {
            if (usuario.length === 0) {
                resp.status(404).send({ success: false, message: 'Perfil no encontrado por Id' });
            } else {
                const args = {
                    Id: usuario[0].Id,
                    UsuarioId: usuario[0].UsuarioId,
                    Nombre: usuario[0].Nombre,
                    FotoPerfil: usuario[0].FotoPerfil,
                    Pin: usuario[0].Pin,
                    FechaNacimiento: usuario[0].FechaNacimiento,
                    Infantil: usuario[0].Infantil,
                };
                resp.status(200).send({
                    success: true,
                    message: 'Perfil obtenido correctamente mediante Id',
                    arguments: args,
                });
            }
        }
    });
});

//Crear Perfil
router.post('/create', function (req, res) {
    let { UsuarioId, Nombre, FotoPerfil, Pin, FechaNacimiento, Infantil } = req.body;



    connection.query('INSERT INTO perfiles SET ?', { UsuarioId, Nombre, FotoPerfil, Pin, FechaNacimiento, Infantil }, function (err) {
        if (err) {
            console.error('Error al crear el perfil: ', err);
            res.status(500).send({ message: err + 'Error al crear el perfil ' });
        } else {
            console.log('Perfil creado correctamente');
            res.status(200).send({ message: 'Bien' });
        }
    });
});


// Modificar Perfil
router.post('/update', async function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    let { Id, Nombre, FotoPerfil, Pin, FechaNacimiento, Infantil } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!Nombre || !Pin || !FechaNacimiento) {
        console.log('Argumentos incompletos para editar un perfil!');
        res.status(400).json({ error: 'Consulta incompleta para editar un perfil' });
        return;
    }

  
    // Actualizar el perfil en la base de datos
    connection.query(
        'UPDATE perfiles SET Nombre = ?, FotoPerfil = ?, Pin = ?, FechaNacimiento = ?, Infantil = ? WHERE Id = ?',
        [Nombre, FotoPerfil, Pin, FechaNacimiento, Infantil, Id],
        function (err) {
            if (err) {
                console.error('Error al editar un perfil: ', err);
                res.status(500).send({ message: err + ' Error al editar el perfil' });
            } else {
                console.log('Perfil editado correctamente');
                res.status(200).send({ message: 'Bien' });
            }
        }
    );
});


//Eliminar producto por Id
router.post('/delete', function (req, res) {
    // Extraer los datos del cuerpo de la solicitud
    const perfilId = req.body.Id;


    connection.query(
        'DELETE FROM perfiles WHERE Id = ?', [perfilId],
        function (err) {
            if (err) {
                console.error('Error al eliminar un perfil: ', err);
                res.status(500).send({ success: false });
            } else {
                console.log('Perfil eliminado correctamente');
                res.status(200).send({ success: true });
            }
        }
    );
});


// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\mario\\Documents\\Imagenes_Smart_Family\\Perfiles\\');
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
    const uploadsDirectory = 'C:\\Users\\mario\\Documents\\Imagenes_Smart_Family\\Perfiles\\';

    // Ruta completa del archivo a buscar
    const filePath = path.join(uploadsDirectory, fileName);

    // Verificar si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe, devolver un error
            res.status(404).json({ error: 'El archivo no existe' +filePath});
            return;
        }

        // Si el archivo existe, enviarlo como respuesta
        res.sendFile(filePath);
    });
});


module.exports = router;
