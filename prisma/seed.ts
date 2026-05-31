import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      phone: '+998901234567',
      first_name: 'Admin',
      last_name: 'User',
      password,
      role: Role.admin,
    },
  });

  console.log(`Admin seeded: ${admin.phone}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
