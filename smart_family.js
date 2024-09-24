const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuración de la base de datos
const db = mysql.createConnection({
    host: '172.27.147.244', // Cambia esto si tu base de datos está en un servidor remoto
    user: 'root',      // Tu usuario de MySQL
    password: 'root',      // La contraseña de tu MySQL
    database: 'smart_family' // El nombre de tu base de datos
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Endpoint para obtener todos los perfiles (ejemplo)
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Error en la consulta SQL');
            return;
        }
        res.json(results);
    });
});

// Escuchar en el puerto
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
