const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'huellitas_burbujas',
    port: process.env.DB_PORT || 3306
};

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_desarrollo');
        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = TRUE',
            [decoded.userId]
        );
        connection.end();

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token no válido' });
    }
};

// Middleware de administrador
const requireAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Se requieren privilegios de administrador' });
    }
    next();
};

// Rutas de Autenticación
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Verificar si el usuario ya existe
        const [existingUsers] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            connection.end();
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insertar nuevo usuario
        const [result] = await connection.execute(
            'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, telefono]
        );

        connection.end();

        // Generar token JWT
        const token = jwt.sign(
            { userId: result.insertId },
            process.env.JWT_SECRET || 'secreto_desarrollo',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: result.insertId,
                nombre,
                email,
                telefono
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Buscar usuario
        const [users] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
            [email]
        );

        if (users.length === 0) {
            connection.end();
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            connection.end();
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        connection.end();

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'secreto_desarrollo',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de Servicios
app.get('/api/services', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [services] = await connection.execute(
            'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre'
        );
        connection.end();

        res.json(services);
    } catch (error) {
        console.error('Error obteniendo servicios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de Citas
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { mascota_id, servicio_id, fecha, hora, observaciones } = req.body;
        
        if (!mascota_id || !servicio_id || !fecha || !hora) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const connection = await mysql.createConnection(dbConfig);
        
        // Verificar disponibilidad
        const [existingBookings] = await connection.execute(
            'SELECT id FROM citas WHERE fecha = ? AND hora = ? AND estado IN ("pendiente", "confirmada")',
            [fecha, hora]
        );

        if (existingBookings.length > 0) {
            connection.end();
            return res.status(400).json({ error: 'La hora seleccionada no está disponible' });
        }

        // Crear cita
        const [result] = await connection.execute(
            'INSERT INTO citas (usuario_id, mascota_id, servicio_id, fecha, hora, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, mascota_id, servicio_id, fecha, hora, observaciones]
        );

        connection.end();

        res.status(201).json({
            message: 'Cita creada exitosamente',
            bookingId: result.insertId
        });

    } catch (error) {
        console.error('Error creando cita:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [bookings] = await connection.execute(`
            SELECT c.*, s.nombre as servicio_nombre, s.precio as servicio_precio,
                   m.nombre as mascota_nombre, m.especie as mascota_especie
            FROM citas c
            JOIN servicios s ON c.servicio_id = s.id
            JOIN mascotas m ON c.mascota_id = m.id
            WHERE c.usuario_id = ?
            ORDER BY c.fecha DESC, c.hora DESC
        `, [req.user.id]);

        connection.end();
        res.json(bookings);
    } catch (error) {
        console.error('Error obteniendo citas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de Productos
app.get('/api/products', async (req, res) => {
    try {
        const { categoria, search } = req.query;
        let query = `
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p 
            JOIN categorias c ON p.categoria_id = c.id 
            WHERE p.activo = TRUE
        `;
        const params = [];

        if (categoria) {
            query += ' AND c.nombre = ?';
            params.push(categoria);
        }

        if (search) {
            query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.nombre';

        const connection = await mysql.createConnection(dbConfig);
        const [products] = await connection.execute(query, params);
        connection.end();

        res.json(products);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});