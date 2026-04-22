import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get password from command line or use default
const password = process.argv[2] || '0r5wHmpBmInk';
const username = process.argv[3] || 'admin';

// Generate hash
const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

// Create credentials object
const credentials = {
    username: username,
    passwordHash: hash
};

// Save to file
const credentialsPath = path.join(__dirname, '../data/admin-credentials.json');
const dataDir = path.dirname(credentialsPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

console.log('✅ Credenciais geradas com sucesso!');
console.log(`📁 Arquivo: ${credentialsPath}`);
console.log(`👤 Usuário: ${username}`);
console.log(`🔑 Hash: ${hash}`);
console.log('\n⚠️  IMPORTANTE: Não compartilhe o hash publicamente!');
