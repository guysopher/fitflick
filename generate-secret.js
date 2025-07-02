#!/usr/bin/env node

// Simple script to generate a NextAuth secret
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');
console.log('Generated NextAuth Secret:');
console.log(secret);
console.log('\nAdd this to your .env.local file:');
console.log(`NEXTAUTH_SECRET=${secret}`); 