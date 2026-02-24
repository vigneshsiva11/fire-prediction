import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

async function createAdmin() {
  try {
    await connectDB();

    const username = 'superadmin';
    const plainPassword = 'StrongPassword@123';

    const existing = await Admin.findOne({ username });

    if (existing) {
      console.log(`Admin '${username}' already exists.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await Admin.create({
      username,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(`Admin '${username}' created successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
