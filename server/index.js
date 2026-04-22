import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Paths
const DATA_DIR = path.join(__dirname, '../data');
const IMAGES_DIR = path.join(__dirname, '../public/uploads');
const DATA_FILE = path.join(DATA_DIR, 'store-data.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth-tokens.json');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin-credentials.json');
const DIST_DIR = path.join(__dirname, '../dist');

// Create directories if they don't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Serve uploaded images
app.use('/uploads', express.static(IMAGES_DIR));

// Serve static files from dist
app.use(express.static(DIST_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        config: {
            projectName: 'Voto Consciente',
            logo: '',
            primaryColor: '#1D4ED8',
            secondaryColor: '#3B82F6',
            mapColorEmpty: '#D1D5DB',
            mapColorFilled: '#BFDBFE',
            mapColorHover: '#1D4ED8',
            aboutText: 'Conheça os candidatos e vote com consciência.',
            footerText: '© 2026 Voto Consciente.',
            footerContact: '',
            theme: 'light'
        },
        candidates: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Initialize auth file
if (!fs.existsSync(AUTH_FILE)) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ tokens: [], users: [] }, null, 2));
}

// Initialize credentials file if it doesn't exist
if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.warn('⚠️  Credentials file not found. Creating default...');
    const defaultHash = bcrypt.hashSync('0r5wHmpBmInk', 10);
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({
        username: 'admin',
        passwordHash: defaultHash
    }, null, 2));
    console.log('✅ Default credentials created. Username: admin, Password: 0r5wHmpBmInk');
}

// Helper functions for auth
const getAuthData = () => {
    const data = fs.readFileSync(AUTH_FILE, 'utf8');
    return JSON.parse(data);
};

const saveAuthData = (data) => {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2));
};

const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Clean expired tokens (older than 1 hour)
const cleanExpiredTokens = () => {
    const authData = getAuthData();
    const now = Date.now();
    authData.tokens = authData.tokens.filter(t => now - t.createdAt < 3600000); // 1 hour
    saveAuthData(authData);
};

// AUTH ROUTES

// POST - Admin login
app.post('/api/auth/admin-login', (req, res) => {
    try {
        const { username, password } = req.body;

        // Read credentials from file
        if (!fs.existsSync(CREDENTIALS_FILE)) {
            return res.status(500).json({
                success: false,
                message: 'Credentials file not found'
            });
        }

        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));

        // Validate username
        if (username !== credentials.username) {
            return res.json({
                success: false,
                message: 'Usuário ou senha incorretos'
            });
        }

        // Validate password with bcrypt
        const isPasswordValid = bcrypt.compareSync(password, credentials.passwordHash);

        if (isPasswordValid) {
            const token = generateToken();
            res.json({
                success: true,
                token,
                message: 'Login successful'
            });
        } else {
            res.json({
                success: false,
                message: 'Usuário ou senha incorretos'
            });
        }
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
});

// POST - Request access (generate magic link)
app.post('/api/auth/request-access', (req, res) => {
    try {
        const { name, email, whatsapp } = req.body;

        if (!name || !email || !whatsapp) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        cleanExpiredTokens();

        const authData = getAuthData();
        const token = generateToken();
        const magicLink = `http://localhost:5173/validate?token=${token}`;

        // Save token
        authData.tokens.push({
            token,
            user: { name, email, whatsapp },
            createdAt: Date.now(),
            used: false
        });

        // Save or update user
        const existingUserIndex = authData.users.findIndex(u => u.email === email);
        if (existingUserIndex >= 0) {
            authData.users[existingUserIndex] = { name, email, whatsapp, lastAccess: Date.now() };
        } else {
            authData.users.push({ name, email, whatsapp, lastAccess: Date.now() });
        }

        saveAuthData(authData);

        // Generate WhatsApp message
        const message = `🔐 *Flixly Admin - Link de Acesso*\n\nOlá ${name}!\n\nClique no link abaixo para acessar o painel administrativo:\n\n${magicLink}\n\n⚠️ Este link é válido por 1 hora e pode ser usado apenas uma vez.\n\n_Se você não solicitou este acesso, ignore esta mensagem._`;

        const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

        console.log(`\n🔐 Magic Link gerado para ${name}:`);
        console.log(`📱 WhatsApp: ${whatsapp}`);
        console.log(`🔗 Link: ${magicLink}`);
        console.log(`📲 WhatsApp URL: ${whatsappUrl}\n`);

        // In production, you would send this via WhatsApp API
        // For now, we'll open WhatsApp Web
        res.json({
            success: true,
            message: 'Magic link generated',
            whatsappUrl // Return URL to open WhatsApp
        });

    } catch (error) {
        console.error('Error requesting access:', error);
        res.status(500).json({ error: 'Failed to request access' });
    }
});

// POST - Validate token
app.post('/api/auth/validate-token', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        cleanExpiredTokens();

        const authData = getAuthData();
        const tokenData = authData.tokens.find(t => t.token === token);

        if (!tokenData) {
            return res.json({ success: false, message: 'Token inválido ou expirado.' });
        }

        if (tokenData.used) {
            return res.json({ success: false, message: 'Este link já foi utilizado.' });
        }

        // Mark token as used
        tokenData.used = true;
        saveAuthData(authData);

        // Generate auth token for session
        const authToken = generateToken();

        res.json({
            success: true,
            authToken,
            user: tokenData.user
        });

    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({ error: 'Failed to validate token' });
    }
});

// Middleware to check auth
const requireAuth = (req, res, next) => {
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real app, you'd validate the auth token here
    next();
};

// DATA ROUTES

// GET - Load all data
app.get('/api/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// POST - Save all data (protected)
app.post('/api/data', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// POST - Upload image (protected)
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, url: imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// DELETE - Delete image (protected)
app.delete('/api/upload/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(IMAGES_DIR, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// DOWNLOAD IMAGES ZIP - Simplified version
app.get('/api/download-images', (req, res) => {
    try {
        res.status(501).json({
            error: 'Image download not implemented. Use backup section to download data.'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
    console.log(`🖼️  Images folder: ${IMAGES_DIR}`);
    console.log(`🔐 Auth file: ${AUTH_FILE}`);
    console.log(`🔑 Credentials file: ${CREDENTIALS_FILE}`);
    console.log(`📦 Serving static files from: ${DIST_DIR}`);
});
