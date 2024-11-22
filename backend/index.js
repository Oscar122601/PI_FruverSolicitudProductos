const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexión con MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'bd-productos',
});

db.connect((err) => {
  if (err) {
    console.log('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para obtener los productos
app.get('/productos', (req, res) => {
  const query = 'SELECT idproducto, nombre FROM producto';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Ruta para obtener los estados
app.get('/estados', (req, res) => {
  const query = 'SELECT idestados, estados FROM estados';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Ruta para crear un lote
app.post('/lote', (req, res) => {
  const { idproducto, fechaEnt, idestados, cantidad, fechaCad, proveedor } = req.body;

  // Verificar el estado según la fecha de caducidad
  const estado = new Date(fechaCad) < new Date() ? 2 : 1; // 2: vencido, 1: válido

  const query = 'INSERT INTO lote (idproducto, fechaEnt, idestados, cantidad, fechaCad, proveedor) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [idproducto, fechaEnt, estado, cantidad, fechaCad, proveedor], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Lote creado con éxito', idlote: results.insertId });
    }
  });
});

// Ruta para obtener los lotes
app.get('/lotes', (req, res) => {
  const query = `
    SELECT l.idlote, p.nombre AS producto, l.fechaEnt, e.estados AS estado, l.cantidad, l.fechaCad, l.proveedor 
    FROM lote l
    JOIN producto p ON l.idproducto = p.idproducto
    JOIN estados e ON l.idestados = e.idestados`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Ruta para eliminar un lote
app.delete('/lote/:idlote', (req, res) => {
  const { idlote } = req.params;
  const query = 'DELETE FROM lote WHERE idlote = ?';
  db.query(query, [idlote], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Lote eliminado con éxito' });
    }
  });
});

// Iniciar el servidor
app.listen(5000, () => {
  console.log('Servidor corriendo en el puerto 5000');
});
