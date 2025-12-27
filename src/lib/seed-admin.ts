import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

async function seedAdmin() {
  console.log('🚀 seed-admin started');

  await connectDB();

  const email = 'admin@kapithan.com';
  const password = 'admin123'; // ❗ CHANGE AFTER FIRST LOGIN

  // Check if admin already exists
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log('❌ Admin already exists:', email);
    process.exit(0);
  }

  const passwordHash = await Admin.hashPassword(password);

  const admin = await Admin.create({
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  console.log('✅ Admin seeded successfully');
  console.log('Email:', admin.email);
  console.log('Password:', password);
  console.log('⚠️ LOGIN AND CHANGE PASSWORD IMMEDIATELY');

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Admin seed failed');
  console.error(err);
  process.exit(1);
});
