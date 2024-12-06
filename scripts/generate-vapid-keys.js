import webpush from 'web-push';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function generateVapidKeys() {
  try {
    const vapidKeys = webpush.generateVAPIDKeys();
    
    // Read existing .env content
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = await fs.readFile(envPath, 'utf-8');
    
    // Update or add VAPID keys
    const envLines = envContent.split('\n');
    const updatedLines = envLines.filter(line => 
      !line.startsWith('VITE_VAPID_PUBLIC_KEY=') && 
      !line.startsWith('VITE_VAPID_PRIVATE_KEY=')
    );
    
    updatedLines.push(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    updatedLines.push(`VITE_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    
    // Write back to .env file
    await fs.writeFile(envPath, updatedLines.join('\n'));
    
    console.log('VAPID Keys generated and saved to .env file');
  } catch (error) {
    console.error('Error generating VAPID keys:', error);
    process.exit(1);
  }
}

generateVapidKeys();