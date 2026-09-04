require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('=== Badilisha Password ya Admin ===\n');

  // List all admin users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });

  if (users.length === 0) {
    console.error('Hakuna watumiaji wowote kwenye database.');
    rl.close();
    process.exit(1);
  }

  console.log('Watumiaji waliopo:');
  users.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email} -- ${u.name} (${u.role})`);
  });

  const email = await ask('\nWeka barua pepe ya admin: ');
  const trimmedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (!user) {
    console.error(`Hakuna mtumiaji mwenye barua pepe: ${trimmedEmail}`);
    rl.close();
    process.exit(1);
  }

  const newPassword = await ask('Weka password mpya (angalau herufi 8): ');
  if (newPassword.length < 8) {
    console.error('Password lazima iwe angalau herufi 8.');
    rl.close();
    process.exit(1);
  }

  const confirmPassword = await ask('Thibitisha password mpya: ');
  if (newPassword !== confirmPassword) {
    console.error('Password hazifanani. Jaribu tena.');
    rl.close();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email: trimmedEmail },
    data: { password: hashedPassword },
  });

  console.log(`\nPassword imebadilishwa kwa mafanikio kwa: ${user.email}`);
  console.log('Sasa unaweza login kwenye /login na password mpya.');

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
