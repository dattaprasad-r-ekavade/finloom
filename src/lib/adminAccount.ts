import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

export const DEFAULT_ADMIN_EMAIL = 'admin@finloom.local';
export const DEFAULT_ADMIN_PASSWORD = 'Admin@12345678';
export const DEFAULT_ADMIN_NAME = 'Finloom Admin';

export async function getPrimaryAdminUser() {
  return prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function ensurePrimaryAdminUser() {
  const existing = await getPrimaryAdminUser();
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  return prisma.user.create({
    data: {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      name: DEFAULT_ADMIN_NAME,
      role: 'ADMIN',
    },
  });
}

export async function updatePrimaryAdminUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const admin = await ensurePrimaryAdminUser();
  const passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.user.update({
    where: { id: admin.id },
    data: {
      email: input.email.trim().toLowerCase(),
      passwordHash,
      name: input.name?.trim() || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  });
}
