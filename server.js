const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas exitosamente');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
});

// Definir esquema de Usuario (basado en tu estructura real)
const usuarioSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  edad: Number,
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: String
}, {
  timestamps: true
});

// Crear modelo (usando la colección 'usuarios' que ya tienes)
const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo usuario
app.post('/api/users', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar usuario (para cambiar estado activo)
app.put('/api/users/:id', async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});