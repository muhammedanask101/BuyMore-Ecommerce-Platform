import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

async function seedAdmin() {
  console.log('🚀 Seeding admin…');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Missing environment variables');
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD');
    process.exit(1);
  }

  await connectDB();

  const existing = await Admin.findOne({ email: email.toLowerCase() });

  if (existing) {
    console.log('ℹ️ Admin already exists:', email);
    process.exit(0);
  }

  const passwordHash = await Admin.hashPassword(password);

  const admin = await Admin.create({
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  console.log('✅ Admin created successfully');
  console.log('Email:', admin.email);
  console.log('⚠️ Change the password after first login');

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Admin seed failed');
  console.error(err);
  process.exit(1);
});
