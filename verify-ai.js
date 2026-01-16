import fs from 'fs';
import OpenAI from 'openai';

// simple env parser
const env = fs.readFileSync('.env', 'utf8');
const keyLine = env.split('\n').find(line => line.startsWith('VITE_OPENAI_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1].trim() : null;

if (!apiKey) {
    console.error('❌ No API Key found in .env file!');
    process.exit(1);
}

console.log(`🔑 Key found: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
console.log('📡 Testing connection to OpenAI...');

const openai = new OpenAI({ apiKey });

async function verify() {
    try {
        const list = await openai.models.list();
        console.log('✅ Connection Successful!');
        console.log(`🤖 Available Models detected: ${list.data.length} (Context Link Established)`);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
    }
}

verify();
